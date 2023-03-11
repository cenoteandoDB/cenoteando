package org.cenoteando.auth.request;

import static org.cenoteando.exceptions.ErrorMessage.*;

import org.cenoteando.exceptions.CenoteandoException;

public class RegisterRequest {

    private String email;
    private String name;
    private String password;

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getName() {
        return name;
    }

    public void validatePassword() {
        if (
            password == null || password.isEmpty()
        ) throw new CenoteandoException(PASSWORD_REQUIRED);
        if (password.length() < 6) throw new CenoteandoException(
            PASSWORD_LENGTH
        );
    }
}
