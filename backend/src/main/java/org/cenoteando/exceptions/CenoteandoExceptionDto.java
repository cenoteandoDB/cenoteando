package org.cenoteando.exceptions;



import java.util.Date;

import static org.cenoteando.exceptions.ErrorMessage.UNEXPECTED_ERROR;

public class CenoteandoExceptionDto {
    private final String errorMessage;
    private final Date timestamp;

    public CenoteandoExceptionDto(CenoteandoException e) {
        this.errorMessage = e.getMessage();
        this.timestamp = new Date();
    }

    public CenoteandoExceptionDto(ErrorMessage errorMessage) {
        this.errorMessage = errorMessage.message;
        this.timestamp = new Date();
    }

    public CenoteandoExceptionDto(Exception e) {
        this.errorMessage = UNEXPECTED_ERROR.message;
        this.timestamp = new Date();
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public Date getTimestamp() {
        return timestamp;
    }
}
