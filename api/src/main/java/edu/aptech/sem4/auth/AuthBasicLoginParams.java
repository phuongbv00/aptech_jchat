package edu.aptech.sem4.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthBasicLoginParams {
    private String email;
    private String password;
}
