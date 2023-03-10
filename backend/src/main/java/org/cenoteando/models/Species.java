package org.cenoteando.models;

import com.arangodb.springframework.annotation.ArangoId;
import com.arangodb.springframework.annotation.Document;
import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonSetter;
import java.util.Date;

import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.StringUtils;
import org.cenoteando.impexp.DomainEntity;
import org.cenoteando.impexp.Visitor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;

@Document("Species")
@Getter
@Setter
public class Species extends DomainEntity {

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

    @JsonGetter("iNaturalistId")
    public String getInaturalistId() {
        return this.iNaturalistId;
    }

    @JsonSetter("iNaturalistId")
    public void setInaturalistId(String inaturalistId) {
        this.iNaturalistId = inaturalistId;
    }

    public void merge(Species species) {
        this.aphiaId = species.getAphiaId();
        this.iNaturalistId = species.getInaturalistId();
    }

    @Override
    public boolean validate() {
        return StringUtils.isNotEmpty(aphiaId) || StringUtils.isNotBlank(iNaturalistId);
    }

    @Override
    public void accept(Visitor visitor){
        visitor.visit(this);
    }
}
