package org.cenoteando.models;

import com.arangodb.springframework.annotation.ArangoId;
import com.arangodb.springframework.annotation.Document;
import java.util.Date;
import java.util.List;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Persistent;

@Document("Comments")
@Getter
@Setter
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

}
