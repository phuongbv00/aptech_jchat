package edu.aptech.sem4.services;

import edu.aptech.sem4.constants.TopicConstant;
import edu.aptech.sem4.dto.WebsocketMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class ChatServiceImpl implements ChatService {
    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    @Override
    public void handleSendTextChatMessage(WebsocketMessage websocketMessage) {
        var dest = TopicConstant.SEND_TEXT_CHAT + "/" + websocketMessage.getTo();
        simpMessagingTemplate.convertAndSend(dest, websocketMessage);
    }
}
