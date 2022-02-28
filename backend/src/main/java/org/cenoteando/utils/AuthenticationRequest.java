package org.cenoteando.utils;

public class AuthenticationRequest {

    private String email;
    private String password;

    public AuthenticationRequest() {}

    public AuthenticationRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public void validatePassword() throws Exception {
        if (password == null) throw new Exception("Password required");
        if (password.isEmpty()) throw new Exception("Password cannot be empty");
        if (password.length() < 6) throw new Exception(
            "Password should have at least 6 characters"
        );
    }
}
