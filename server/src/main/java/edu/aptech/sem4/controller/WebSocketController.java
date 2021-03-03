package edu.aptech.sem4.controller;

import edu.aptech.sem4.auth.JwtProvider;
import edu.aptech.sem4.constants.EventConstant;
import edu.aptech.sem4.dto.WebsocketMessage;
import edu.aptech.sem4.services.ChatService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Controller
@Slf4j
public class WebSocketController {
    @Autowired
    private ChatService chatService;

    @Autowired
    private JwtProvider jwtProvider;

    @MessageMapping("/index")
    public void index(@Payload WebsocketMessage msg, @Header(name = "token") String token) {
        msg.setFrom(jwtProvider.getCredentials(token));
        log.info("RECEIVED MESSAGE: " + msg.toString());
        switch (msg.getEvent()) {
            case EventConstant.SEND_TEXT_CHAT:
                chatService.handleSendTextChatMessage(msg);
                break;
            case EventConstant.GET_CHAT_TOPICS:
                chatService.handleGetChatTopicsMessage(msg);
                break;
            case EventConstant.CREATE_CHAT_TOPIC:
                chatService.handleCreateChatTopicMessage(msg);
                break;
            case EventConstant.GET_USERS:
                chatService.handleGetUsersMessage(msg);
                break;
            case EventConstant.GET_CHAT_HISTORY:
                chatService.handleGetChatHistoryMessage(msg);
                break;
            case EventConstant.CHAT_SEEN:
                chatService.handleChatSeenMessage(msg);
                break;
            case EventConstant.UPDATE_CHAT_GROUP:
                chatService.handleUpdateChatGroupMessage(msg);
                break;
            case EventConstant.LEAVE_CHAT_GROUP:
                chatService.handleLeaveChatGroupMessage(msg);
                break;
            case EventConstant.CHANGE_CHAT_GROUP_AVATAR:
                chatService.handleChangeChatGroupAvatar(msg);
                break;
            default:
                break;
        }
    }
}
