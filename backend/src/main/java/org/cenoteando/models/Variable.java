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

@Document("Variables")
@Getter
@Setter
public class Variable extends DomainEntity {

    public enum VariableOrigin {
        FIELD,
        OFFICE,
        BOTH,
    }

    public enum VariableType {
        TEXT("TEXT"),
        BOOLEAN("BOOLEAN"),
        ENUM("ENUM"),
        JSON("JSON"),
        UNITLESS_NUMBER("UNITLESS_NUMBER"),
        NUMBER_WITH_UNITS("NUMBER_WITH_UNITS"),
        DATETIME("DATETIME"),
        DATE("DATE"),
        TIME("TIME");

        private String type;

        VariableType(String type) {
            this.type = type;
        }

        public String getVariableType(){
            return type;
        }
    }

    public enum AccessLevel {
        PUBLIC,
        PRIVATE,
        SENSITIVE,
    }

    public enum Theme {
        LOCATION,
        GEOREFERENCE,
        CULTURAL,
        GEOMORPHOLOGY,
        BIODIVERSITY,
        DISTURBANCE,
        TOURISM,
        DIVING,
        ORGANIZATION,
        REGULATION,
        WATER,
    }

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

    @Ref
    @CreatedBy
    private User creator;

    @CreatedDate
    @PersistentIndexed
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    public Variable(
        String name,
        String description,
        VariableType type,
        String units,
        List<String> enumValues,
        Boolean timeseries,
        Boolean multiple,
        AccessLevel accessLevel,
        Theme theme,
        VariableOrigin origin,
        String methodology
    ) {
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

    public Variable() {}

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
        this.enumValues = ImportCSV.toList(enumValues);
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

    @JsonSetter("accessLevel")
    public void setAccessLevel(AccessLevel accessLevel) {
        this.accessLevel = accessLevel;
    }

    public void setAccessLevel(String accessLevel) {
        this.accessLevel = AccessLevel.valueOf(accessLevel);
    }

    public Theme getTheme() {
        return theme;
    }

    @JsonSetter("theme")
    public void setTheme(Theme theme) {
        this.theme = theme;
    }

    public void setTheme(String theme) {
        this.theme = Theme.valueOf(theme);
    }

    public VariableOrigin getOrigin() {
        return origin;
    }

    @JsonSetter("origin")
    public void setOrigin(VariableOrigin origin) {
        this.origin = origin;
    }

    public void setOrigin(String origin) {
        this.origin = VariableOrigin.valueOf(origin);
    }

    public String getMethodology() {
        return methodology;
    }

    @JsonIgnore
    public String getCreator() {
        if (creator != null) {
            return creator.getName();
        }
        return null;
    }

    public void setCreator(User user) {
        this.creator = user;
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

    public void merge(Variable variable) {
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

    @Override
    public void accept(Visitor visitor){
        visitor.visit(this);
    }
    @Override
    public boolean validate() {
        if(valuesNotNull()){
            return checkVariableType();
        }
        return false;
    }

    public boolean valuesNotNull(){
        return name != null && description != null && type != null
                && accessLevel != null && theme != null && origin != null;
    }

    public boolean checkVariableType(){
        if (type == VariableType.ENUM) {
            return enumValues != null;
        } else if (type == VariableType.NUMBER_WITH_UNITS) {
            return units != null;
        } else {
            return true;
        }
    }

    public boolean isCreator(User user) {
        if (creator == null) {
            return false;
        }
        return user.getEmail().equals(creator.getEmail());
    }

    @Override
    public String toString() {
        return (
            "Variable{" +
            "id='" +
            id +
            '\'' +
            ", arangoId='" +
            arangoId +
            '\'' +
            ", name='" +
            name +
            '\'' +
            ", description='" +
            description +
            '\'' +
            ", type=" +
            type +
            ", units='" +
            units +
            '\'' +
            ", enumValues=" +
            enumValues +
            ", timeseries=" +
            timeseries +
            ", multiple=" +
            multiple +
            ", accessLevel=" +
            accessLevel +
            ", theme=" +
            theme +
            ", origin=" +
            origin +
            ", methodology='" +
            methodology +
            '\'' +
            ", createdAt=" +
            createdAt +
            ", updatedAt=" +
            updatedAt +
            '}'
        );
    }
}
