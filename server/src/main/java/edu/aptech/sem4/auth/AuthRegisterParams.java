package edu.aptech.sem4.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthRegisterParams {
    private String email;
    private String password;
    private String fullName;
    private String confirmPassword;
    private boolean terms;
}
