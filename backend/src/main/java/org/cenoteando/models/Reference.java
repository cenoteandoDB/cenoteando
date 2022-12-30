package org.cenoteando.models;

import com.arangodb.springframework.annotation.ArangoId;
import com.arangodb.springframework.annotation.Document;
import com.arangodb.springframework.annotation.PersistentIndexed;
import java.util.Date;

import org.cenoteando.impexp.DomainEntity;
import org.cenoteando.impexp.Visitor;
import org.json.JSONArray;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.supercsv.cellprocessor.Optional;
import org.supercsv.cellprocessor.constraint.NotNull;
import org.supercsv.cellprocessor.ift.CellProcessor;

@Document("References")
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

    public void setId(String id) {
        this.id = id;
    }

    public void setArangoId(String arangoId) {
        this.arangoId = arangoId;
    }

    public String getId() {
        return id;
    }

    public String getArangoId() {
        return arangoId;
    }

    public String getAuthors() {
        return authors;
    }

    public void setAuthors(String authors) {
        this.authors = authors;
    }

    public String getShortName() {
        return shortName;
    }

    public void setShortName(String shortName) {
        this.shortName = shortName;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public Type getType() {
        return type;
    }

    public void setType(Type type) {
        this.type = type;
    }

    public void setType(String type) {
        this.type = Type.valueOf(type);
    }

    public String getYear() {
        return year;
    }

    public void setYear(String year) {
        this.year = year;
    }

    public boolean getHasFile() {
        return hasFile;
    }

    public void setHasFile(boolean hasFile) {
        this.hasFile = hasFile;
    }

    public void setHasFile(String hasFile) {
        this.hasFile = Boolean.valueOf(hasFile);
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
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

    public static CellProcessor[] getProcessors() {
        return new CellProcessor[] {
            new NotNull(), // id
            new NotNull(), // authors
            new Optional(), // shortName
            new NotNull(), // reference
            new Optional(), // year
            new Optional(), // hasFile
        };
    }
}
