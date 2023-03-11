package org.cenoteando.models;

import com.arangodb.springframework.annotation.ArangoId;
import com.arangodb.springframework.annotation.Document;
import com.arangodb.springframework.annotation.PersistentIndexed;
import com.arangodb.springframework.annotation.Ref;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSetter;
import java.util.Date;
import java.util.List;

import lombok.Getter;
import lombok.Setter;
import org.cenoteando.impexp.DomainEntity;
import org.cenoteando.impexp.ImportCSV;
import org.cenoteando.impexp.Visitor;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;

import static org.apache.commons.lang3.StringUtils.isNotEmpty;

@Document("Cenotes")
@Getter
@Setter
public class Cenote extends DomainEntity {

    public enum CenoteType {
        NO_TYPE,
        CENOTE,
        DRY_CAVE,
        WATER_WELL,
        WATERY,
    }

    public enum Issue {
        GEOTAG_NOT_VERIFIED,
    }

    @Id
    private String id;

    @ArangoId
    private String arangoId;

    private CenoteType cenoteType;
    private String name;
    private boolean touristic;
    private List<Issue> issues;
    private List<String> alternativeNames;
    private Social social;
    private CenoteGeoJSON geojson;

    @Ref
    private Gadm gadm;

    @Ref
    @CreatedBy
    private User creator;

    @CreatedDate
    @PersistentIndexed
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    public boolean getTouristic(){
        return touristic;
    }

    public void setIssues(String issues) {
        List<String> list = ImportCSV.toList(issues);
        this.issues = list.stream().map(Issue::valueOf).toList();
    }

    @JsonSetter("social")
    public void setSocial(Social social) {
        this.social = social;
    }

    public GadmProperties getGadm() {
        return gadm.getProperties();
    }

    @JsonIgnore
    public CenoteGeoJSON getGeojson() {
        return geojson;
    }

    public List<Double> getCoordinates() {
        return this.geojson.getGeometry().getCoordinates();
    }

    public void setCoordinates(String coordinates) {
        if (coordinates == null || coordinates.equals("[]")) return;
        coordinates = coordinates.replace(",",".");
        coordinates = coordinates.substring(2, coordinates.length() - 2);
        String[] values = coordinates.split(" ");

        this.geojson =
            new CenoteGeoJSON(
                Double.parseDouble(values[0]),
                Double.parseDouble(values[1])
            );
    }

    @JsonIgnore
    public String getCreator() {
        return creator != null ? creator.getName() : null;
    }

    public void merge(Cenote cenote) {
        this.cenoteType = cenote.getCenoteType();
        this.name = cenote.getName();
        this.touristic = cenote.getTouristic();
        this.issues = cenote.getIssues();
        this.alternativeNames = cenote.getAlternativeNames();
        this.geojson = cenote.getGeojson();
    }

    @Override
    public boolean validate() {
        return cenoteType != null && isNotEmpty(name) && geojson != null;
    }

    @Override
    public void accept(Visitor visitor){
        visitor.visit(this);
    }

    public boolean isCreator(User user) {
        if (creator == null) return false;
        return user.getEmail().equals(creator.getEmail());
    }

}
