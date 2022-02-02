package org.cenoteando.controllers;

import javax.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.cenoteando.jwt.JwtUtil;
import org.cenoteando.models.User;
import org.cenoteando.models.AuthDetails;
import org.cenoteando.services.UsersService;
import org.cenoteando.utils.AuthenticationRequest;

import static org.cenoteando.models.User.Role.CENOTERO;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtTokenUtil;

    @Autowired
    private UsersService usersService;

    @PostMapping("/login")
    public User Login(@RequestBody AuthenticationRequest authenticationRequest, HttpServletResponse response) throws Exception {

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authenticationRequest.getEmail(), authenticationRequest.getPassword())
            );
        }
        catch (BadCredentialsException e) {
            throw new Exception("Incorrect username or password", e);
        }

        final AuthDetails auth = this.usersService
                .loadUserByUsername(authenticationRequest.getEmail());

        final String jwt = jwtTokenUtil.generateToken(auth);
        response.addHeader("X-Session-Id", jwt);

        return auth.getUser();
    }

    @PostMapping("/register")
    public User Register(@RequestBody AuthenticationRequest authenticationRequest, HttpServletResponse response) throws Exception {

        authenticationRequest.validatePassword();

        User user = new User(authenticationRequest.getEmail(), authenticationRequest.getPassword(), CENOTERO);
        usersService.createUser(user);

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authenticationRequest.getEmail(), authenticationRequest.getPassword())
            );
        }
        catch (BadCredentialsException e) {
            throw new Exception("Incorrect username or password", e);
        }

        final AuthDetails auth = this.usersService
                .loadUserByUsername(authenticationRequest.getEmail());

        final String jwt = jwtTokenUtil.generateToken(auth);
        response.addHeader("X-Session-Id", jwt);

        return auth.getUser();
    }
}
