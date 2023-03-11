package org.cenoteando.auth.request;

public class LoginRequest {

    private String email;
    private String password;

    public LoginRequest() {}

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }
}
