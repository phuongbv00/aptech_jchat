package edu.aptech.sem4.controller;

import edu.aptech.sem4.auth.AuthBasicLoginParams;
import edu.aptech.sem4.auth.AuthRegisterParams;
import edu.aptech.sem4.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/auth")
public class AuthController {
    @Autowired
    AuthService authService;

    @PostMapping("login")
    public Object login(@RequestBody AuthBasicLoginParams params) {
        return authService.login(params);
    }

    @PostMapping("register")
    public Object register(@RequestBody AuthRegisterParams params) throws Exception {
        var token = authService.register(params);
        if (token == null)
            throw new Exception();
        return token;
    }

    @DeleteMapping("logout")
    public void logout() {
        
    }
}
