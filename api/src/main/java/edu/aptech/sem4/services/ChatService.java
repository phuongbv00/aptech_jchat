package edu.aptech.sem4.services;

import edu.aptech.sem4.dto.WebsocketMessage;

public interface ChatService {
    void handleSendTextChatMessage(WebsocketMessage websocketMessage);
}
