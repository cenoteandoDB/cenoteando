package org.cenoteando.controllers;

import org.cenoteando.dtos.AuthDto;
import org.cenoteando.jwt.JwtUtil;
import org.cenoteando.models.AuthDetails;
import org.cenoteando.models.User;
import org.cenoteando.services.UsersService;
import org.cenoteando.utils.AuthenticationRequest;
import org.cenoteando.utils.RegisterRequest;
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

  private static String tokenType = "Bearer";

  @PostMapping("/login")
  public AuthDto Login(@RequestBody AuthenticationRequest authenticationRequest)
    throws Exception {
    try {
      authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(
          authenticationRequest.getEmail(),
          authenticationRequest.getPassword()
        )
      );
    } catch (BadCredentialsException e) {
      throw new Exception("Incorrect username or password", e);
    }

    final AuthDetails auth =
      this.usersService.loadUserByUsername(authenticationRequest.getEmail());

    final String jwt = jwtTokenUtil.generateToken(auth);

    return new AuthDto(auth.getUser(), jwt, tokenType, jwtTokenUtil.getTTL());
  }

  @PostMapping("/register")
  public AuthDto Register(@RequestBody RegisterRequest registerRequest) throws Exception {
    registerRequest.validatePassword();

    User user = new User(
      registerRequest.getEmail(),
      registerRequest.getName(),
      registerRequest.getPassword(),
      User.Role.CENOTERO_BASIC
    );
    usersService.createUser(user);

    try {
      authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(
          registerRequest.getEmail(),
          registerRequest.getPassword()
        )
      );
    } catch (BadCredentialsException e) {
      throw new Exception("Incorrect username or password", e);
    }

    final AuthDetails auth =
      this.usersService.loadUserByUsername(registerRequest.getEmail());

    final String jwt = jwtTokenUtil.generateToken(auth);

    return new AuthDto(auth.getUser(), jwt, tokenType, jwtTokenUtil.getTTL());
  }
}
