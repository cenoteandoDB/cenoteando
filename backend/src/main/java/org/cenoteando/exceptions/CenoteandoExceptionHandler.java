package org.cenoteando.exceptions;

import static org.cenoteando.exceptions.ErrorMessage.ACCESS_DENIED;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class CenoteandoExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(CenoteandoException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public CenoteandoExceptionDto cenoteandoException(CenoteandoException e) {
        return new CenoteandoExceptionDto(e);
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public CenoteandoExceptionDto accessDeniedException(
        AccessDeniedException e
    ) {
        return new CenoteandoExceptionDto(ACCESS_DENIED);
    }

    // @ExceptionHandler(Exception.class)
    // @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    // public CenoteandoExceptionDto randomException(Exception e) {
    //     return new CenoteandoExceptionDto(e);
    // }
}
