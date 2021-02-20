package edu.aptech.sem4.dto;

import edu.aptech.sem4.models.User;
import lombok.Builder;
import lombok.Data;
import lombok.ToString;

import java.util.Map;

@Data
@Builder
@ToString
public class WebsocketMessage {
    private String event;
    private User from;
    private Map<String, String> data;
}
