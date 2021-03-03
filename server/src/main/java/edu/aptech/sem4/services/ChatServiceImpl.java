package edu.aptech.sem4.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.aptech.sem4.constants.SystemMessageConstant;
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
import java.util.Arrays;
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

    private ChatMessage createSysMess(ChatTopic topic, String sysMess, User creator, List<User> members) {
        if (members != null && !members.isEmpty()) {
            sysMess = sysMess
                    .replace(
                            "${members}",
                            members.stream()
                                    .map(User::getFullName)
                                    .reduce("", (acc, cur) -> acc.isEmpty() ? cur : acc + ", " + cur)
                    );
        }
        return ChatMessage.builder()
                .createdBy(creator)
                .createdAt(LocalDateTime.now())
                .text(sysMess.replace("${creator}", creator.getFullName()))
                .topic(topic)
                .isSystem(true)
                .build();
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
        if (topic == null) return;
        var hasImage = websocketMessage.getData().containsKey("image");
        if (hasImage) {
            topic.setLastMessage("sent an image");
        } else {
            topic.setLastMessage(websocketMessage.getData().get("text"));
        }
        topic.setUpdatedBy(websocketMessage.getFrom());
        topic.setUpdatedAt(LocalDateTime.now());
        topic = chatTopicRepository.save(topic);

        var chatMessageBuilder = ChatMessage.builder()
                .createdBy(websocketMessage.getFrom())
                .createdAt(LocalDateTime.now())
                .topic(topic);

        if (hasImage) {
            chatMessageBuilder = chatMessageBuilder
                    .text("sent an image")
                    .image(websocketMessage.getData().get("image"));
        } else {
            chatMessageBuilder = chatMessageBuilder
                    .text(websocketMessage.getData().get("text"));
        }

        var chatMess = chatMessageRepository.save(chatMessageBuilder.build());

        for (var participant : topic.getParticipants()) {
            if (!participant.getId().equals(websocketMessage.getFrom().getId())) {
                unseen(topic.getId(), participant.getId());
            }
            send(TopicConstant.SEND_TEXT_CHAT, participant.getId().toString(), chatMess);
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
            var participantIds = topic.getParticipants().stream().map(User::getId).collect(Collectors.toList());
            var participants = userRepository.findByIdIn(participantIds);
            topic.setParticipants(participants);
            topic.setIsGroup(isGroup);

            if (topic.getParticipants().size() < 2) {
                throw new Exception("Participants not enough");
            } else if (!isGroup && topic.getParticipants().size() == 2) {
                var opponent = filterParticipantsExcepts(topic.getParticipants(), websocketMessage.getFrom())
                        .stream()
                        .findFirst()
                        .orElse(null);
                var myPersonalTopics = chatTopicRepository
                        .findByParticipantsIdAndIsGroup(websocketMessage.getFrom().getId(), false);
                for (var t: myPersonalTopics) {
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

            // sys message
            var sysMess = isGroup
                    ? createSysMess(topic, SystemMessageConstant.CREATE_CHAT_GROUP, topic.getCreatedBy(), null)
                    : createSysMess(topic, SystemMessageConstant.CREATE_CHAT_PERSONAL, topic.getCreatedBy(), null);
            sysMess = chatMessageRepository.save(sysMess);

            topic.setLastMessage(sysMess.getText());
            topic = chatTopicRepository.save(topic);

            for (var p : topic.getParticipants()) {
                if (p.getId().equals(websocketMessage.getFrom().getId())) {
                    topic.setUnseen(false);
                } else {
                    topic.setUnseen(true);
                    unseen(topic.getId(), p.getId());
                }
                send(TopicConstant.CREATE_CHAT_TOPIC, p.getId().toString(), topic);
                send(TopicConstant.SEND_TEXT_CHAT, p.getId().toString(), sysMess);
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

    @Override
    public void handleUpdateChatGroupMessage(WebsocketMessage websocketMessage) {
        var data = websocketMessage.getData();
        var topic = chatTopicRepository.findById(Long.valueOf(data.get("topicId"))).orElse(null);
        if (topic == null) {
            return;
        }

        // title
        var title = data.get("title");
        var isRenamed = !topic.getTitle().equals(title) && !title.isEmpty();
        if (!title.isEmpty()) {
            topic.setTitle(title);
        }

        // participants
        try {
            var oldMembers = topic.getParticipants();
            var newMemberIds = Arrays.asList(
                    objectMapper.readValue(data.get("participants"), User[].class)
            ).stream().map(User::getId).collect(Collectors.toList());
            var newMembers = userRepository.findByIdIn(newMemberIds);
            var removedMembers = oldMembers.stream()
                    .filter(u -> newMembers.stream().noneMatch(u2 -> u2.getId().equals(u.getId())))
                    .collect(Collectors.toList());
            var addedMembers = newMembers.stream()
                    .filter(u -> oldMembers.stream().noneMatch(u2 -> u2.getId().equals(u.getId())))
                    .collect(Collectors.toList());
            var originMembers = newMembers.stream()
                    .filter(u -> oldMembers.stream().anyMatch(u2 -> u2.getId().equals(u.getId())))
                    .collect(Collectors.toList());

            topic.setParticipants(newMembers);
            topic.setUpdatedBy(websocketMessage.getFrom());
            topic.setUpdatedAt(LocalDateTime.now());
            topic = chatTopicRepository.save(topic);

            ChatMessage sysMessRename = null;
            ChatMessage sysMessAddMembers = null;
            ChatMessage sysMessRemoveMembers = null;

            if (isRenamed) {
                sysMessRename = createSysMess(topic, SystemMessageConstant.RENAME_CHAT_GROUP, websocketMessage.getFrom(), null);
                sysMessRename = chatMessageRepository.save(sysMessRename);
                topic.setLastMessage(sysMessRename.getText());
            }

            if (!addedMembers.isEmpty()) {
                sysMessAddMembers = createSysMess(topic, SystemMessageConstant.ADD_MEMBER_CHAT_GROUP, websocketMessage.getFrom(), addedMembers);
                sysMessAddMembers = chatMessageRepository.save(sysMessAddMembers);
                topic.setLastMessage(sysMessAddMembers.getText());
            }

            if (!removedMembers.isEmpty()) {
                sysMessRemoveMembers = createSysMess(topic, SystemMessageConstant.REMOVE_MEMBER_CHAT_GROUP, websocketMessage.getFrom(), removedMembers);
                sysMessRemoveMembers = chatMessageRepository.save(sysMessRemoveMembers);
                topic.setLastMessage(sysMessRemoveMembers.getText());
            }

            topic = chatTopicRepository.save(topic);

            for (var member: removedMembers) {
                send(TopicConstant.REMOVE_CHAT_GROUP, member.getId().toString(), topic);
            }

            for (var member: addedMembers) {
                if (member.getId().equals(websocketMessage.getFrom().getId())) {
                    topic.setUnseen(false);
                } else {
                    topic.setUnseen(true);
                    unseen(topic.getId(), member.getId());
                }
                send(TopicConstant.CREATE_CHAT_TOPIC, member.getId().toString(), topic);
                if (sysMessRename != null) {
                    send(TopicConstant.SEND_TEXT_CHAT, member.getId().toString(), sysMessRename);
                }
                if (sysMessAddMembers != null) {
                    send(TopicConstant.SEND_TEXT_CHAT, member.getId().toString(), sysMessAddMembers);
                }
                if (sysMessRemoveMembers != null) {
                    send(TopicConstant.SEND_TEXT_CHAT, member.getId().toString(), sysMessRemoveMembers);
                }
            }

            for (var member: originMembers) {
                if (member.getId().equals(websocketMessage.getFrom().getId())) {
                    topic.setUnseen(false);
                } else {
                    topic.setUnseen(true);
                    unseen(topic.getId(), member.getId());
                }
                send(TopicConstant.UPDATE_CHAT_GROUP, member.getId().toString(), topic);
                if (sysMessRename != null) {
                    send(TopicConstant.SEND_TEXT_CHAT, member.getId().toString(), sysMessRename);
                }
                if (sysMessAddMembers != null) {
                    send(TopicConstant.SEND_TEXT_CHAT, member.getId().toString(), sysMessAddMembers);
                }
                if (sysMessRemoveMembers != null) {
                    send(TopicConstant.SEND_TEXT_CHAT, member.getId().toString(), sysMessRemoveMembers);
                }
            }
        } catch (JsonProcessingException e) {
            log.error(e.getMessage());
        }
    }

    @Override
    public void handleLeaveChatGroupMessage(WebsocketMessage websocketMessage) {
        var data = websocketMessage.getData();
        var topic = chatTopicRepository.findById(Long.valueOf(data.get("topicId"))).orElse(null);
        if (topic == null) {
            return;
        }
        topic.setParticipants(
                topic.getParticipants()
                        .stream()
                        .filter(u -> !u.getId().equals(websocketMessage.getFrom().getId()))
                        .collect(Collectors.toList())
        );
        topic.setUpdatedAt(LocalDateTime.now());
        topic.setUpdatedBy(websocketMessage.getFrom());
        topic.setLastMessage(websocketMessage.getFrom().getFullName() + " has left group");
        topic = chatTopicRepository.save(topic);

        var sysMess = createSysMess(topic, SystemMessageConstant.LEAVE_CHAT_GROUP, websocketMessage.getFrom(), null);
        sysMess = chatMessageRepository.save(sysMess);

        topic.setLastMessage(sysMess.getText());
        topic = chatTopicRepository.save(topic);

        for (var p: topic.getParticipants()) {
            if (p.getId().equals(websocketMessage.getFrom().getId())) {
                topic.setUnseen(false);
            } else {
                topic.setUnseen(true);
                unseen(topic.getId(), p.getId());
            }
            send(TopicConstant.UPDATE_CHAT_GROUP, p.getId().toString(), topic);
            send(TopicConstant.SEND_TEXT_CHAT, p.getId().toString(), sysMess);
        }

        send(TopicConstant.REMOVE_CHAT_GROUP, websocketMessage.getFrom().getId().toString(), topic);
    }
}
