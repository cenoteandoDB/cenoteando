package org.cenoteando.models;

import com.arangodb.springframework.annotation.ArangoId;
import com.arangodb.springframework.annotation.Document;
import com.arangodb.springframework.annotation.PersistentIndexed;
import com.fasterxml.jackson.annotation.JsonSetter;
import org.cenoteando.utils.CsvImportExport;
import org.json.JSONArray;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.supercsv.cellprocessor.Collector;
import org.supercsv.cellprocessor.Optional;
import org.supercsv.cellprocessor.ParseBool;
import org.supercsv.cellprocessor.ParseEnum;
import org.supercsv.cellprocessor.constraint.NotNull;
import org.supercsv.cellprocessor.ift.CellProcessor;

import java.util.*;


@Document("Variables")
public class Variable {

    public enum VariableOrigin {FIELD, OFFICE, BOTH};

    public enum VariableType {TEXT, STRING, BOOLEAN, ENUM, JSON, UNITLESS_NUMBER, NUMBER_WITH_UNITS, DATETIME, DATE, TIME, NO_TYPE};

    public enum AccessLevel {PUBLIC, PRIVATE, SENSITIVE};

    public enum Theme {LOCATION, GEOREFERENCE, CULTURAL, GEOMORPHOLOGY, BIODIVERSITY, DISTURBANCE, TOURISM, DIVING, ORGANIZATION, REGULATION, WATER}

    @Id // db document field: _key
    private String id;

    @ArangoId // db document field: _id
    private String arangoId;

    private String name;
    private String description;
    private VariableType type;
    private String units;
    private List<String> enumValues;
    private Boolean timeseries;
    private Boolean multiple;
    private AccessLevel accessLevel;
    private Theme theme;
    private VariableOrigin origin;
    private String methodology;

    @CreatedDate
    @PersistentIndexed
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    public Variable(String name, String description, VariableType type, String units, List<String> enumValues, Boolean timeseries, Boolean multiple, AccessLevel accessLevel, Theme theme, VariableOrigin origin, String methodology) {
        this.name = name;
        this.description = description;
        this.type = type;
        this.units = units;
        this.enumValues = enumValues;
        this.timeseries = timeseries;
        this.multiple = multiple;
        this.accessLevel = accessLevel;
        this.theme = theme;
        this.origin = origin;
        this.methodology = methodology;
    }

    public Variable(){}

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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public VariableType getType() {
        return type;
    }

    public void setType(VariableType type) {
        this.type = type;
    }

    public void setType(String type){
        this.type = VariableType.valueOf(type);
    }

    public String getUnits() {
        return units;
    }

    public void setUnits(String units) {
        this.units = units;
    }

    public List<String> getEnumValues() {
        return enumValues;
    }

    @JsonSetter("enumValues")
    public void setEnumValues(List<String> enumValues) {
        this.enumValues = enumValues;
    }

    public void setEnumValues(String enumValues) {
        this.enumValues = CsvImportExport.stringToList(enumValues);
    }

    public Boolean getTimeseries() {
        return timeseries;
    }

    public void setTimeseries(Boolean timeseries) {
        this.timeseries = timeseries;
    }

    public Boolean getMultiple() {
        return multiple;
    }

    public void setMultiple(Boolean multiple) {
        this.multiple = multiple;
    }

    public AccessLevel getAccessLevel() {
        return accessLevel;
    }

    public void setAccessLevel(AccessLevel accessLevel) {
        this.accessLevel = accessLevel;
    }

    public void setAccessLevel(String accessLevel){
        this.accessLevel = AccessLevel.valueOf(accessLevel);
    }

    public Theme getTheme() {
        return theme;
    }

    public void setTheme(Theme theme) {
        this.theme = theme;
    }

    public void setTheme(String theme){
        this.theme = Theme.valueOf(theme);
    }

    public VariableOrigin getOrigin() {
        return origin;
    }

    public void setOrigin(VariableOrigin origin) {
        this.origin = origin;
    }

    public void setOrigin(String origin){
        this.origin = VariableOrigin.valueOf(origin);
    }

    public String getMethodology() {
        return methodology;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setMethodology(String methodology) {
        this.methodology = methodology;
    }

    public void setUpdatedAt(String updatedAt) {
    }

    public void setCreatedAt(String createdAt) {
    }

    public void merge(Variable variable){
        this.name = variable.getName();
        this.description = variable.getDescription();
        this.type = variable.getType();
        this.units = variable.getUnits();
        this.enumValues = variable.getEnumValues();
        this.timeseries = variable.getTimeseries();
        this.multiple = variable.getMultiple();
        this.accessLevel = variable.getAccessLevel();
        this.theme = variable.getTheme();
        this.origin = variable.getOrigin();
        this.methodology = variable.getMethodology();
    }

    public boolean validate(){
        if(name != null && description != null && type != null && accessLevel != null && theme != null && origin != null && timeseries != null && multiple != null){
            if(type == VariableType.ENUM)
                return enumValues != null && units == null;
            else if(type == VariableType.NUMBER_WITH_UNITS)
                return units != null && enumValues == null;
        }
        return false;
    }

    public static JSONArray getHeaders(){
        return new JSONArray("['id', 'arangoId', 'name', 'description', 'type', 'units', 'enumValues', 'timeseries', " +
                "'multiple', 'accessLevel', 'theme', 'origin', 'methodology', 'createdAt', 'updatedAt']");
    }

    public static CellProcessor[] getProcessors(){
        CellProcessor string = null;
        return new CellProcessor[]{
                new NotNull(), // id
                new NotNull(), // arangoId
                new NotNull(), // name
                new NotNull(), // description
                new NotNull(), // type
                new Optional(), // units
                new Optional(), // enumValues
                new NotNull(new ParseBool()), // timeseries
                new NotNull(new ParseBool()), // mutltiple
                new NotNull(), // accessLevel
                new NotNull(), // theme
                new NotNull(), // origin
                new Optional(), // methodology
                new Optional(), // createdAt
                new Optional(), // updatedAt
        };
    }

}
