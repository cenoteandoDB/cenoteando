package org.cenoteando.exceptions;

public enum ErrorMessage {
    ACCESS_DENIED("Access denied"),
    CLASSNAME_NOT_FOUND("Unable to export data type"),
    UNEXPECTED_ERROR("Something went wrong"),
    INVALID_LOGIN("Password and email don't match. Try again"),
    USER_EXISTS("User with given email already exists"),
    PASSWORD_REQUIRED("Password cannot be empty"),
    PASSWORD_LENGTH("Password too short. Minimum size 6"),
    READ_ACCESS("User doesn't have permission to read %s: %s"),
    CREATE_PERMISSION("User doesn't have permission to create %s"),
    UPDATE_PERMISSION("User doesn't have permission to update %s: %s"),
    DELETE_PERMISSION("User doesn't have permission to delete %s: %s"),
    INVALID_FORMAT("Object format not valid"),
    GADM_NOT_FOUND("Gadm not found"),
    THEME_ACCESS("User doesn't have permission to theme %s"),
    REFERENCE_NOT_FOUND("Reference not found"),
    INVALID_ROLE("Invalid role"),
    READ_FILE("Unable to read file"),
    WRONG_AUTH_HEADER("Wrong authorization header. Must start with 'Bearer '"),
    EXPIRED_TOKEN("Authorization token expired. Refresh token."),
    WRITE_CSV("Unable to write file");

    public final String message;

    ErrorMessage(String message) {
        this.message = message;
    }
}
