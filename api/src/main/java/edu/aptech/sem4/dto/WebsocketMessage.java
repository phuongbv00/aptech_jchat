package edu.aptech.sem4.dto;

import edu.aptech.sem4.models.User;
import lombok.*;

import java.util.Map;

@Data
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class WebsocketMessage {
    private String event;
    private User from;
    private Map<String, String> data;
}
