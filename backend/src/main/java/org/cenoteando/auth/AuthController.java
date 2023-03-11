package org.cenoteando.auth;

import static org.cenoteando.exceptions.ErrorMessage.INVALID_LOGIN;

import org.cenoteando.auth.jwt.JwtProvider;
import org.cenoteando.auth.request.LoginRequest;
import org.cenoteando.auth.request.RegisterRequest;
import org.cenoteando.dtos.AuthDto;
import org.cenoteando.exceptions.CenoteandoException;
import org.cenoteando.models.User;
import org.cenoteando.services.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    private UsersService usersService;

    private static final String tokenType = "Bearer";

    @PostMapping("/login")
    public AuthDto login(@RequestBody LoginRequest loginRequest) {
        User user;
        try {
            Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
                )
            );
            AuthDetails authDetails = (AuthDetails) auth.getPrincipal();
            user = authDetails.getUser();
        } catch (BadCredentialsException e) {
            throw new CenoteandoException(INVALID_LOGIN);
        }

        final String jwt = jwtProvider.generateToken(user.getName());

        return new AuthDto(
            user,
            jwt,
            tokenType,
            jwtProvider.getTtl()
        );
    }

    @PostMapping("/register")
    public User register(@RequestBody RegisterRequest registerRequest) {
        registerRequest.validatePassword();

        User user = new User(
            registerRequest.getEmail(),
            registerRequest.getName(),
            bCryptPasswordEncoder.encode(registerRequest.getPassword()),
            User.Role.CENOTERO_BASIC
        );

        return usersService.createUser(user);
    }
}
