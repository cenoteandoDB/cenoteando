package org.cenoteando.models;

import java.util.Date;

public class Comment {

    private int rating;
    private String text;
    private Date timestamp;

    public Comment(int rating, String text, Date timestamp) {
        this.rating = rating;
        this.text = text;
        this.timestamp = timestamp;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Date timestamp) {
        this.timestamp = timestamp;
    }
}

