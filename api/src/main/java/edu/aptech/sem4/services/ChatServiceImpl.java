package edu.aptech.sem4.services;

import com.fasterxml.jackson.core.JsonProcessingException;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
public class ChatServiceImpl implements ChatService {
    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ChatTopicRepository chatTopicRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Override
    public void send(String baseTopic, String endpoint, Object data) {
        var dest = baseTopic + "/" + endpoint;
        simpMessagingTemplate.convertAndSend(dest, data);
        log.info("SENT MESSAGE: destination=" + dest + ", data=" + data.toString());
    }

    @Override
    public void handleSendTextChatMessage(WebsocketMessage websocketMessage) {
        var topic = ChatTopic.builder()
                .id(Long.valueOf(websocketMessage.getData().get("topicId")))
                .build();
        var chatMess = chatMessageRepository.save(ChatMessage.builder()
                .createdBy(websocketMessage.getFrom())
                .text(websocketMessage.getData().get("text"))
                .topic(topic)
                .build());
        send(TopicConstant.SEND_TEXT_CHAT, topic.getId().toString(), chatMess);
    }

    @Override
    public void handleGetChatTopicsMessage(WebsocketMessage websocketMessage) {
        var topics = chatTopicRepository
                .findChatTopicByParticipantsContainsOrderByUpdatedAtDesc(websocketMessage.getFrom());
        send(TopicConstant.GET_CHAT_TOPICS, websocketMessage.getFrom().getId().toString(), topics);
    }

    @Override
    public void handleCreateChatTopicMessage(WebsocketMessage websocketMessage) {
        try {
            var topic = objectMapper
                    .readValue(websocketMessage.getData().get("topic"), ChatTopic.class);
            topic.setCreatedAt(LocalDateTime.now());
            topic.setUpdatedAt(LocalDateTime.now());
            topic.setCreatedBy(websocketMessage.getFrom());
            topic.setUpdatedBy(websocketMessage.getFrom());
            topic = chatTopicRepository.save(topic);
            for (var participant : topic.getParticipants()) {
                send(TopicConstant.CREATE_CHAT_TOPIC, participant.getId().toString(), topic);
            }
        } catch (JsonProcessingException e) {
            log.error(e.getMessage());
        }
    }

    @Override
    public void handleGetUsersMessage(WebsocketMessage websocketMessage) {
        var data = websocketMessage.getData();
        var keyword = data.get("keyword");
        var page = Integer.valueOf(data.get("page"));
        var limit = Integer.valueOf(data.get("limit"));
        Page<User> users = userRepository.findAllByFullNameLike(keyword, PageRequest.of(page, limit));
        send(TopicConstant.CREATE_CHAT_TOPIC, websocketMessage.getFrom().getId().toString(), users);
    }
}
