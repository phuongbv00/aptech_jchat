package edu.aptech.sem4.services;

import edu.aptech.sem4.auth.AuthBasicLoginParams;
import edu.aptech.sem4.auth.AuthRegisterParams;

public interface AuthService {
    Object login(AuthBasicLoginParams params);
    Object register(AuthRegisterParams params);
}
