package org.cenoteando.models;

import com.arangodb.springframework.annotation.*;
import com.arangodb.springframework.core.geo.GeoJsonPoint;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import org.cenoteando.utils.CsvImportExport;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.supercsv.cellprocessor.Collector;
import org.supercsv.cellprocessor.Optional;
import org.supercsv.cellprocessor.ParseBool;
import org.supercsv.cellprocessor.constraint.NotNull;
import org.supercsv.cellprocessor.ift.CellProcessor;

import java.util.*;
import java.util.stream.Collectors;

class Social {

    private int totalComments;
    private float rating;

    public Social(){
        totalComments = 0;
        rating = 0;
    }

    public Social(int totalComments, float rating){
        this.totalComments = totalComments;
        this.rating = rating;
    }

    public int getTotalComments() {
        return totalComments;
    }

    public void setTotalComments(int totalComments) {
        this.totalComments = totalComments;
    }

    public float getRating() {
        return rating;
    }

    public void setRating(float rating) {
        this.rating = rating;
    }

    @Override
    public String toString(){
        return "{ " + totalComments + ", " + rating + " }";
    }
}

@Document("Cenotes")
public class Cenote {

    public enum Type {NO_TYPE, CENOTE, DRY_CAVE, WATER_WELL, WATERY,}

    public enum Issue {GEOTAG_NOT_VERIFIED}

    @Id
    private String id;

    @ArangoId
    private String arangoId;

    private Type type;
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


    public Cenote(){}


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

    public Type getType() {
        return type;
    }

    public String getName() {
        return name;
    }

    public boolean isTouristic() {
        return touristic;
    }

    public boolean getTouristic(){return touristic;}

    public List<Issue> getIssues() {
        return issues;
    }

    public List<String> getAlternativeNames() {
        return alternativeNames;
    }

    public Social getSocial() {
        return social;
    }

    public CenoteGeoJSON getGeojson() {
        return geojson;
    }

    public GadmProperties getGadm() {
        return gadm.getGadmProperties();
    }

    @JsonSetter("type")
    public void setType(Type type) {
        this.type = type;
    }

    public void setType(String type){
        this.type = Type.valueOf(type);
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setTouristic(boolean touristic) {
        this.touristic = touristic;
    }

    @JsonSetter("issues")
    public void setIssues(List<Issue> issues) {
        this.issues = issues;
    }

    public void setIssues(String issues){
        List<String> string_list =  CsvImportExport.stringToList(issues);
        this.issues = string_list.stream().map(Issue::valueOf).toList();

    }

    @JsonSetter("social")
    public void setSocial(Social social){
        this.social = social;
    }

    @JsonSetter("alternativeNames")
    public void setAlternativeNames(List<String> alternativeNames) {
        this.alternativeNames = alternativeNames;
    }

    public void setAlternativeNames(String alternativeNames) {
        this.alternativeNames = CsvImportExport.stringToList(alternativeNames);
    }

    @JsonSetter("geojson")
    public void setGeojson(CenoteGeoJSON geojson) {
        this.geojson = geojson;
    }

    @JsonIgnore
    public List<Double> getCoordinates(){
        return this.geojson.getGeometry().getCoordinates();
    }

    public void setCoordinates(String coordinates){
        if(coordinates == null || coordinates.equals("[]"))
            return;
        coordinates = coordinates.substring(1, coordinates.length() - 1);
        String[] values = coordinates.split(",");

        this.geojson = new CenoteGeoJSON(Double.parseDouble(values[0]), Double.parseDouble(values[1]));
    }

    public void setGadm(Gadm gadm) {
        this.gadm = gadm;
    }

    @JsonIgnore
    public String getCreator(){
        if(creator != null)
            return creator.getName();
        return null;
    }

    public void setCreator(User user){
        this.creator = user;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }


    public void merge(Cenote cenote){
        this.type = cenote.getType();
        this.name = cenote.getName();
        this.touristic = cenote.getTouristic();
        this.issues = cenote.getIssues();
        this.alternativeNames = cenote.getAlternativeNames();
        this.geojson = cenote.getGeojson();
    }

    public boolean validate(){
        return type != null && name != null && !name.isEmpty() && geojson != null;
    }

    public boolean isCreator(User user){
        if(creator==null)
            return false;
        return user.getEmail().equals(creator.getEmail());
    }

    public static JSONArray getHeaders(){
        return new JSONArray("['id', 'type', 'name', 'touristic', 'issues', 'alternativeNames', 'coordinates']");
    }

    public static CellProcessor[] getProcessors(){
        return new CellProcessor[]{
                new NotNull(), // id
                new NotNull(), // type
                new NotNull(), // name
                new NotNull(new ParseBool()), // touristic
                new NotNull(), // issues
                new NotNull(), // alternativeNames
                new NotNull(), // coordinates
        };
    }
}
