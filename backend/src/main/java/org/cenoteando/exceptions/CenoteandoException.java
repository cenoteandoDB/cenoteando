package org.cenoteando.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class CenoteandoException extends RuntimeException {
    private final ErrorMessage errorMessage;

    public CenoteandoException(ErrorMessage errorMessage){
        super(errorMessage.message);
        this.errorMessage = errorMessage;
    }

    public CenoteandoException(ErrorMessage errorMessage, String value){
        super(String.format(errorMessage.message, value));
        this.errorMessage = errorMessage;
    }

    public CenoteandoException(ErrorMessage errorMessage, String value1, String value2){
        super(String.format(errorMessage.message, value1, value2));
        this.errorMessage = errorMessage;
    }

    public ErrorMessage getErrorMessage() {
        return errorMessage;
    }
}
