package org.cenoteando.models;

import com.arangodb.springframework.annotation.ArangoId;
import com.arangodb.springframework.annotation.Document;
import com.arangodb.springframework.annotation.PersistentIndexed;
import org.json.JSONArray;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.supercsv.cellprocessor.Optional;
import org.supercsv.cellprocessor.constraint.NotNull;
import org.supercsv.cellprocessor.ift.CellProcessor;

import java.util.Date;


@Document("References")
public class Reference {

    public enum Type {BOOK, BOOK_CHAPTER, JOURNAL, OTHER, REPORT, THESIS, WEBPAGE,}

    @Id // db document field: _key
    private String id;

    @ArangoId // db document field: _id
    private String arangoId;

    private String authors;
    private String fileName;
    private String reference;

    private Type type;
    private String year;


    @CreatedDate
    @PersistentIndexed
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    public Reference(){}

    public Reference(String authors, String fileName, String reference, Type type, String year) {
        this.authors = authors;
        this.fileName = fileName;
        this.type = type;
        this.reference = reference;
        this.year = year;
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

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
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

    public void setType(String type){
        this.type = Type.valueOf(type);
    }

    public String getYear() {
        return year;
    }

    public void setYear(String year) {
        this.year = year;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
    }

    public void merge(Reference ref){
        authors = ref.getAuthors();
        fileName = ref.getFileName();
        reference = ref.getReference();
        year = ref.getYear();
        type = ref.getType();
    }

    public boolean validate(){
        return authors != null && !authors.isEmpty() && reference != null && !reference.isEmpty();
    }

    public static JSONArray getHeaders(){
        return new JSONArray("['id', 'arangoId', 'authors', 'fileName', 'reference', 'year', 'createdAt', 'updatedAt']");
    }

    public static CellProcessor[] getProcessors(){
        return new CellProcessor[]{
                new NotNull(), // id
                new NotNull(), // arandoId
                new NotNull(), // authors
                new Optional(), // fileName
                new NotNull(), // reference
                new Optional(), // year
                new Optional(), // createdAt
                new Optional() // updatedAt
        };
    }

    @Override
    public String toString() {
        return "Reference{" +
                "id='" + id + '\'' +
                ", arangoId='" + arangoId + '\'' +
                ", authors='" + authors + '\'' +
                ", fileName='" + fileName + '\'' +
                ", reference='" + reference + '\'' +
                ", type='" + type + '\'' +
                ", year='" + year + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}

