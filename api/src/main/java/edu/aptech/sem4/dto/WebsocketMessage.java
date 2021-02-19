package edu.aptech.sem4.dto;

import edu.aptech.sem4.models.User;
import lombok.Builder;
import lombok.Data;
import lombok.ToString;

@Data
@Builder
@ToString
public class WebsocketMessage {
    private String text;
    private String event;
    private String to;
    private User from;
}
