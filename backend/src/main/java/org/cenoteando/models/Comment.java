package org.cenoteando.models;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class Comment {

    private int rating;
    private String text;
    private Date timestamp;

    public Comment(int rating, String text, Date timestamp) {
        this.rating = rating;
        this.text = text;
        this.timestamp = timestamp;
    }

}

