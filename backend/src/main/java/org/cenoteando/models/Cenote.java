package org.cenoteando.models;

import com.arangodb.springframework.annotation.*;
import com.arangodb.springframework.core.geo.GeoJsonPoint;
import org.cenoteando.utils.CsvImportExport;
import org.json.JSONArray;
import org.springframework.data.annotation.CreatedDate;
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

class CenoteGeoJSON {

    @GeoIndexed(geoJson = true)
    private GeoJsonPoint geometry;

    private String type;

    //TODO properties

    public CenoteGeoJSON(){}

    public CenoteGeoJSON(GeoJsonPoint geometry, String type) {
        this.geometry = geometry;
        this.type = type;
    }

    public GeoJsonPoint getGeometry() {
        return geometry;
    }

    public void setGeometry(GeoJsonPoint geometry) {
        this.geometry = geometry;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    @Override
    public String toString() {
        return "{geometry=" + geometry + ", type='" + type + "'}";
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

    //Social
    private Social social;

    private CenoteGeoJSON geojson;

    @Ref
    private Gadm gadm;

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

    public void setIssues(List<Issue> issues) {
        this.issues = issues;
    }

    public void setIssues(String issues){
        List<String> string_list =  CsvImportExport.stringToList(issues);
        if(string_list != null)
            this.issues = string_list.stream().map(Issue::valueOf).toList();

    }

    //TODO social
    public void setSocial(String social) {
        if(social.equals("[]") || social == null)
            return;
        social = social.replaceAll(" ", "");
        social = social.substring(1, social.length() - 1);
        String[] values = social.split(",");

        this.social = new Social(Integer.parseInt(values[0]), Float.parseFloat(values[1]));

    }

    public void setAlternativeNames(List<String> alternativeNames) {
        this.alternativeNames = alternativeNames;
    }

    public void setAlternativeNames(String alternativeNames) {
        this.alternativeNames = CsvImportExport.stringToList(alternativeNames);
    }

    public void setGeojson(CenoteGeoJSON geojson) {
        this.geojson = geojson;
    }

    //TODO geojson
    public void setGeojson(String geojson){
    }

    public void setGadm(Gadm gadm) {
        this.gadm = gadm;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setCreatedAt(String createdAt) {
    }

    public void setUpdatedAt(String updatedAt) {
    }

    public void merge(Cenote cenote){
        this.type = cenote.getType();
        this.name = cenote.getName();
        this.touristic = cenote.getTouristic();
        this.issues = cenote.getIssues();
        this.alternativeNames = cenote.getAlternativeNames();
        this.social = cenote.getSocial();
        //TODO geojson
        this.geojson = cenote.getGeojson();
    }

    public boolean validate(){
        //TODO
        return true;
    }

    public static JSONArray getHeaders(){
        return new JSONArray("['id', 'arangoId', 'type', 'name', 'touristic', 'issues', 'alternativeNames', 'social', 'geojson', 'createdAt', 'updatedAt']");
    }

    public static CellProcessor[] getProcessors(){
        List<Object> alternativeNames = new ArrayList<>();
        return new CellProcessor[]{
                new NotNull(), // id
                new NotNull(), // arandoId
                new NotNull(), // type
                new NotNull(), // name
                new NotNull(new ParseBool()), // touristic
                new NotNull(), // issues
                new Collector(alternativeNames), // alternativeNames
                new NotNull(), // social
                new NotNull(), // geojson
                new Optional(), // createdAt
                new Optional() // updatedAt
        };
    }
}
