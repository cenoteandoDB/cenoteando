package org.cenoteando.models;

import com.arangodb.springframework.annotation.GeoIndexed;
import com.arangodb.springframework.core.geo.GeoJsonPoint;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import java.util.HashMap;
import java.util.Objects;

import org.cenoteando.utils.CsvImportExport;

@JsonDeserialize(using = CsvImportExport.CenoteGeoJsonDeserialize.class)
public class CenoteGeoJSON {

    @GeoIndexed(geoJson = true)
    private GeoJsonPoint geometry;

    private String type;

    private HashMap<String, Object> properties;

    public CenoteGeoJSON() {}

    public CenoteGeoJSON(GeoJsonPoint geometry, String type) {
        this.geometry = geometry;
        this.type = type;
        this.properties = new HashMap<>();
    }

    public CenoteGeoJSON(Double x, Double y) {
        this.geometry = new GeoJsonPoint(x, y);
        this.type = "Feature";
        this.properties = new HashMap<>();
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

    public HashMap<String, Object> getProperties() {
        return properties;
    }

    public void setProperties(HashMap<String, Object> properties) {
        this.properties = properties;
    }

    @Override
    public String toString() {
        ObjectMapper mapper = new ObjectMapper();
        String string = null;
        try {
            string = mapper.writeValueAsString(this);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        return string;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CenoteGeoJSON that = (CenoteGeoJSON) o;
        return (
            this.geometry.equals(that.getGeometry()) &&
            this.type.equals(that.getType())
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(geometry, type);
    }
}
