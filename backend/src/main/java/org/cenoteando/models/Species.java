package org.cenoteando.models;

import com.arangodb.springframework.annotation.ArangoId;
import com.arangodb.springframework.annotation.Document;
import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonSetter;
import java.util.Date;
import org.json.JSONArray;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.supercsv.cellprocessor.Optional;
import org.supercsv.cellprocessor.constraint.NotNull;
import org.supercsv.cellprocessor.ift.CellProcessor;

@Document("Species")
public class Species {

  @Id // db document field: _key
  private String id;

  @ArangoId // db document field: _id
  private String arangoId;

  private String aphiaId;

  private String iNaturalistId;

  @CreatedDate
  private Date createdAt;

  @LastModifiedDate
  private Date updatedAt;

  public Species() {}

  public Species(String aphiaId, String iNaturalistId) {
    this.aphiaId = aphiaId;
    this.iNaturalistId = iNaturalistId;
  }

  public String getId() {
    return this.id;
  }

  public String getArangoId() {
    return this.arangoId;
  }

  public String getAphiaId() {
    return this.aphiaId;
  }

  @JsonGetter("iNaturalistId")
  public String getInaturalistId() {
    return this.iNaturalistId;
  }

  public Date getCreatedAt() {
    return this.createdAt;
  }

  public Date getUpdatedAt() {
    return this.updatedAt;
  }

  public void setId(String id) {
    this.id = id;
  }

  public void setArangoId(String arangoId) {
    this.arangoId = arangoId;
  }

  public void setAphiaId(String aphiaId) {
    this.aphiaId = aphiaId;
  }

  @JsonSetter("iNaturalistId")
  public void setInaturalistId(String inaturalistId) {
    this.iNaturalistId = inaturalistId;
  }

  public void merge(Species species) {
    this.aphiaId = species.getAphiaId();
    this.iNaturalistId = species.getInaturalistId();
  }

  public boolean validate() {
    return !(
      (aphiaId == null || aphiaId.isEmpty()) &&
      (iNaturalistId == null || iNaturalistId.isEmpty())
    );
  }

  public static JSONArray getHeaders() {
    return new JSONArray("['id', 'aphiaId', 'inaturalistId']");
  }

  public static CellProcessor[] getProcessors() {
    return new CellProcessor[] {
      new NotNull(), // id
      new Optional(), // aphiaId
      new Optional(), // iNaturalistId
    };
  }
}
