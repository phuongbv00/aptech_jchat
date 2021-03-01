package edu.aptech.sem4.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.aptech.sem4.constants.TopicConstant;
import edu.aptech.sem4.dto.WebsocketMessage;
import edu.aptech.sem4.models.ChatMessage;
import edu.aptech.sem4.models.ChatTopic;
import edu.aptech.sem4.models.User;
import edu.aptech.sem4.repositories.ChatMessageRepository;
import edu.aptech.sem4.repositories.ChatTopicRepository;
import edu.aptech.sem4.repositories.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ChatServiceImpl implements ChatService {
    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private ChatTopicRepository chatTopicRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    private List<User> filterParticipantsExcepts(List<User> participants, User except) {
        return filterParticipantsExcepts(participants, except.getId());
    }

    private List<User> filterParticipantsExcepts(List<User> participants, Long exceptId) {
        return participants.stream()
                .filter(u -> !u.getId().equals(exceptId))
                .collect(Collectors.toList());
    }

    private String unseenKey(Long topicId, Long userId) {
        return "UNSEEN_" + topicId + "_" + userId;
    }

    private boolean isTopicUnseen(Long topicId, Long userId) {
        return redisTemplate.hasKey(unseenKey(topicId, userId));
    }

    private void unseen(Long topicId, Long userId) {
        redisTemplate.opsForValue().set(unseenKey(topicId, userId), true);
    }

    private void seen(Long topicId, Long userId) {
        redisTemplate.delete(unseenKey(topicId, userId));
    }

    @Override
    public void send(String baseTopic, String endpoint, Object data) {
        var dest = baseTopic + "/" + endpoint;
        simpMessagingTemplate.convertAndSend(dest, data);
        log.info("SENT MESSAGE: destination=" + dest);
    }

    @Override
    public void sendException(String endpoint, Exception ex) {
        var dest = TopicConstant.EXCEPTION + "/" + endpoint;
        simpMessagingTemplate.convertAndSend(dest, ex);
        log.info("SENT EXCEPTION: destination=" + dest);
    }

    @Override
    public void handleSendTextChatMessage(WebsocketMessage websocketMessage) {
        var topic = chatTopicRepository
                .findById(Long.valueOf(websocketMessage.getData().get("topicId")))
                .orElse(null);
        if (topic != null) {
            topic.setLastMessage(websocketMessage.getData().get("text"));
            topic.setUpdatedBy(websocketMessage.getFrom());
            topic.setUpdatedAt(LocalDateTime.now());
            topic = chatTopicRepository.save(topic);
            var chatMess = chatMessageRepository.save(ChatMessage.builder()
                    .createdBy(websocketMessage.getFrom())
                    .createdAt(LocalDateTime.now())
                    .text(websocketMessage.getData().get("text"))
                    .topic(topic)
                    .build());
            for (var participant : topic.getParticipants()) {
                if (!participant.getId().equals(websocketMessage.getFrom().getId())) {
                    unseen(topic.getId(), participant.getId());
                }
                send(TopicConstant.SEND_TEXT_CHAT, participant.getId().toString(), chatMess);
            }
        }
    }

    @Override
    public void handleGetChatTopicsMessage(WebsocketMessage websocketMessage) {
        var topics = chatTopicRepository
                .findByParticipantsContainsOrderByUpdatedAtDesc(websocketMessage.getFrom())
                .stream()
                .peek(topic -> topic.setUnseen(isTopicUnseen(topic.getId(), websocketMessage.getFrom().getId())))
                .collect(Collectors.toList());
        send(TopicConstant.GET_CHAT_TOPICS, websocketMessage.getFrom().getId().toString(), topics);
    }

    @Override
    public void handleCreateChatTopicMessage(WebsocketMessage websocketMessage) {
        try {
            var data = websocketMessage.getData();
            var isGroup = Boolean.valueOf(data.get("isGroup"));
            var topic = objectMapper
                    .readValue(data.get("topic"), ChatTopic.class);
            topic.getParticipants().add(websocketMessage.getFrom());

            if (topic.getParticipants().size() < 2) {
                throw new Exception("Participants not enough");
            } else if (!isGroup && topic.getParticipants().size() == 2) {
                var opponent = filterParticipantsExcepts(topic.getParticipants(), websocketMessage.getFrom())
                        .stream()
                        .findFirst()
                        .orElse(null);
                var myTopics = chatTopicRepository.findByParticipantsId(websocketMessage.getFrom().getId());
                for (var t: myTopics) {
                    var exist = t.getParticipants()
                            .stream()
                            .filter(u -> u.getId().equals(opponent.getId()))
                            .findFirst()
                            .orElse(null) != null;
                    if (exist) {
                        throw new Exception("Topic exists");
                    }
                }
                topic.setTitle(null);
            } else if (!isGroup && topic.getParticipants().size() > 2) {
                throw new Exception("Can't create topic");
            } else if (topic.getParticipants().size() < 3) {
                throw new Exception("Group must have at least 3 people");
            } else {
                if (topic.getTitle().isEmpty()) {
                    topic.setTitle(
                            topic.getParticipants()
                                    .stream()
                                    .map(User::getFullName)
                                    .reduce("", (acc, cur) -> acc.isEmpty() ? cur : acc + ", " + cur)
                    );
                }
            }

            topic.setCreatedAt(LocalDateTime.now());
            topic.setUpdatedAt(LocalDateTime.now());
            topic.setCreatedBy(websocketMessage.getFrom());
            topic.setUpdatedBy(websocketMessage.getFrom());
            topic = chatTopicRepository.save(topic);
            for (var participant : topic.getParticipants()) {
                if (participant.getId().equals(websocketMessage.getFrom().getId())) {
                    topic.setUnseen(false);
                } else {
                    topic.setUnseen(true);
                }
                send(TopicConstant.CREATE_CHAT_TOPIC, participant.getId().toString(), topic);
            }
        } catch (Exception e) {
            log.error(e.getMessage());
            sendException(websocketMessage.getFrom().getId().toString(), e);
        }
    }

    @Override
    public void handleGetUsersMessage(WebsocketMessage websocketMessage) {
        var data = websocketMessage.getData();
        var keyword = data.get("keyword");
        var page = Integer.valueOf(data.get("page"));
        var limit = Integer.valueOf(data.get("limit"));
        var users = userRepository.findAllByFullNameContainsAndIdIsNot(
                keyword,
                websocketMessage.getFrom().getId(),
                PageRequest.of(page, limit)
        );
        send(TopicConstant.GET_USERS, websocketMessage.getFrom().getId().toString(), users);
    }

    @Override
    public void handleGetChatHistoryMessage(WebsocketMessage websocketMessage) {
        var data = websocketMessage.getData();
        var topic = ChatTopic.builder().id(Long.valueOf(data.get("topicId"))).build();
        var limit = Integer.valueOf(websocketMessage.getData().get("limit"));
        var beforeMessageId = data.containsKey("beforeMessageId")
                ? Long.valueOf(data.get("beforeMessageId"))
                : null;
        var history = beforeMessageId != null
                ? chatMessageRepository.findByTopicAndIdLessThanOrderByCreatedAtDesc(topic, beforeMessageId, PageRequest.of(0, limit))
                : chatMessageRepository.findByTopicOrderByCreatedAtDesc(topic, PageRequest.of(0, limit));
        history = history.stream()
                .sorted(Comparator.comparing(ChatMessage::getCreatedAt))
                .collect(Collectors.toList());
        send(TopicConstant.GET_CHAT_HISTORY, websocketMessage.getFrom().getId().toString(), history);
    }

    @Override
    public void handleChatSeenMessage(WebsocketMessage websocketMessage) {
        var data = websocketMessage.getData();
        var topicId = Long.valueOf(data.get("topicId"));
        var userId = websocketMessage.getFrom().getId();
        seen(topicId, userId);
        send(TopicConstant.CHAT_SEEN, userId.toString(), topicId);
    }
}
