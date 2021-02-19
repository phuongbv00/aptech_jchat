package edu.aptech.sem4.auth;

import lombok.Data;

@Data
public class AuthRegisterParams {
    private String email;
    private String password;
    private String fullName;
    private String confirmPassword;
}
