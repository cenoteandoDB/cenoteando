package org.cenoteando.auth;

import static org.cenoteando.exceptions.ErrorMessage.INVALID_LOGIN;

import org.cenoteando.auth.request.LoginRequest;
import org.cenoteando.auth.request.RegisterRequest;
import org.cenoteando.dtos.AuthDto;
import org.cenoteando.exceptions.CenoteandoException;
import org.cenoteando.auth.jwt.JwtUtil;
import org.cenoteando.models.AuthDetails;
import org.cenoteando.models.User;
import org.cenoteando.services.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
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
    private JwtUtil jwtTokenUtil;

    @Autowired
    private UsersService usersService;

    private static final String tokenType = "Bearer";

    @PostMapping("/login")
    public AuthDto login(
        @RequestBody LoginRequest loginRequest
    ) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
                )
            );
        } catch (BadCredentialsException e) {
            throw new CenoteandoException(INVALID_LOGIN);
        }

        final AuthDetails auth =
            this.usersService.loadUserByUsername(
                    loginRequest.getEmail()
                );

        final String jwt = jwtTokenUtil.generateToken(auth);

        return new AuthDto(
            auth.getUser(),
            jwt,
            tokenType,
            jwtTokenUtil.getTTL()
        );
    }

    @PostMapping("/register")
    public void register(@RequestBody RegisterRequest registerRequest) {
        registerRequest.validatePassword();

        User user = new User(
            registerRequest.getEmail(),
            registerRequest.getName(),
            registerRequest.getPassword(),
            User.Role.CENOTERO_BASIC
        );
        usersService.createUser(user);
    }
}
