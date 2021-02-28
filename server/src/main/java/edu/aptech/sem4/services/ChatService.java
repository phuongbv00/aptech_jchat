package edu.aptech.sem4.services;

import edu.aptech.sem4.dto.WebsocketMessage;

public interface ChatService {
    void send(String topic, String endpoint, Object data);
    void sendException(String endpoint, Exception ex);
    void handleSendTextChatMessage(WebsocketMessage websocketMessage);
    void handleGetChatTopicsMessage(WebsocketMessage websocketMessage);
    void handleCreateChatTopicMessage(WebsocketMessage websocketMessage);
    void handleGetUsersMessage(WebsocketMessage websocketMessage);
    void handleGetChatHistoryMessage(WebsocketMessage websocketMessage);
    void handleChatSeenMessage(WebsocketMessage websocketMessage);
}
