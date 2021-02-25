package edu.aptech.sem4.services;

import edu.aptech.sem4.auth.CustomUserDetails;
import edu.aptech.sem4.auth.JwtProvider;
import edu.aptech.sem4.auth.AuthBasicLoginParams;
import edu.aptech.sem4.auth.AuthRegisterParams;
import edu.aptech.sem4.models.User;
import edu.aptech.sem4.repositories.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@Slf4j
public class AuthServiceImpl implements AuthService {
    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Object login(AuthBasicLoginParams params) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        params.getEmail(),
                        params.getPassword()
                )
        );
//        var authorities = authentication.getAuthorities()
//                .stream()
//                .map(GrantedAuthority::getAuthority)
//                .collect(Collectors.toList());
        var user = ((CustomUserDetails) authentication.getPrincipal()).getUser();
        return new Object() {
            public final String token = jwtProvider.generateToken(user);
        };
    }

    @Override
    public Object register(AuthRegisterParams params) {
        try {
            if (!params.isTerms())
                throw new Exception("Term not checked");
            if (!params.getConfirmPassword().equals(params.getPassword()))
                throw new Exception("Password != Confirm password");

            var user = new User();
            user.setFullName(params.getFullName());
            user.setEmail(params.getEmail());
            user.setPassword(passwordEncoder.encode(params.getPassword()));
            userRepository.save(user);

            return login(
                    AuthBasicLoginParams.builder()
                            .email(params.getEmail())
                            .password(params.getPassword())
                            .build()
            );
        } catch (Exception ex) {
            log.error(ex.getMessage());
            return null;
        }
    }
}
