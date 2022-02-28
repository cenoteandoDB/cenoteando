package org.cenoteando.models;

import com.arangodb.springframework.annotation.ArangoId;
import com.arangodb.springframework.annotation.Document;
import java.util.Date;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Persistent;

class Comment {

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

@Document("Comments")
public class CommentBucket {

    public enum CommentSource {
        GOOGLE_PLACES,
        TRIPADVISOR,
    }

    @Id // db document field: _key
    private String id;

    @ArangoId // db document field: _id
    private String arangoId;

    @Persistent
    private String cenoteId;

    private CommentSource source;
    private int count;
    private int sumRating;
    private List<Comment> comments;

    public CommentBucket(
        String cenoteId,
        CommentSource source,
        int count,
        List<Comment> comments
    ) {
        this.cenoteId = cenoteId;
        this.source = source;
        this.count = comments.size();
        this.comments = comments;
        this.sumRating = 0;
        for (Comment comment : comments) this.sumRating += comment.getRating();
    }

    public String getCenoteId() {
        return cenoteId;
    }

    public void setCenoteId(String cenoteId) {
        this.cenoteId = cenoteId;
    }

    public CommentSource getSource() {
        return source;
    }

    public void setSource(CommentSource source) {
        this.source = source;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public int getSumRating() {
        return sumRating;
    }

    public void setSumRating(int sumRating) {
        this.sumRating = sumRating;
    }

    public List<Comment> getComments() {
        return comments;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }
}
