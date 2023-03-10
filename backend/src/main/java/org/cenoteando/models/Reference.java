package org.cenoteando.models;

import com.arangodb.springframework.annotation.ArangoId;
import com.arangodb.springframework.annotation.Document;
import com.arangodb.springframework.annotation.PersistentIndexed;
import java.util.Date;

import lombok.Getter;
import lombok.Setter;
import org.cenoteando.impexp.DomainEntity;
import org.cenoteando.impexp.Visitor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;

@Document("References")
@Getter
@Setter
public class Reference extends DomainEntity {

    public enum Type {
        BOOK,
        BOOK_CHAPTER,
        JOURNAL,
        OTHER,
        REPORT,
        THESIS,
        WEBPAGE,
    }

    @Id // db document field: _key
    private String id;

    @ArangoId // db document field: _id
    private String arangoId;

    private String authors;
    private String shortName;
    private String reference;

    private Type type;
    private String year;

    private boolean hasFile;

    @CreatedDate
    @PersistentIndexed
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    public Reference() {}

    public Reference(
        String authors,
        String shortName,
        String reference,
        Type type,
        String year
    ) {
        this.authors = authors;
        this.shortName = shortName;
        this.reference = reference;
        this.type = type;
        this.year = year;
        this.hasFile = false;
    }

    public boolean getHasFile() {
        return hasFile;
    }

    public void merge(Reference ref) {
        authors = ref.getAuthors();
        shortName = ref.getShortName();
        reference = ref.getReference();
        year = ref.getYear();
        type = ref.getType();
        hasFile = ref.getHasFile();
    }

    @Override
    public boolean validate() {
        return (
            authors != null &&
            !authors.isEmpty() &&
            reference != null &&
            !reference.isEmpty()
        );
    }

    @Override
    public void accept(Visitor visitor){
        visitor.visit(this);
    }

}
