package org.cenoteando.models;

import com.arangodb.springframework.annotation.ArangoId;
import com.arangodb.springframework.annotation.Document;
import com.arangodb.springframework.annotation.GeoIndexed;
import com.arangodb.springframework.core.geo.GeoJson;
import com.arangodb.springframework.core.geo.GeoJsonPolygon;
import org.springframework.data.annotation.Id;

import java.util.HashMap;

@Document("Gadm")
public class Gadm {

    @Id
    private String _key;

    @ArangoId
    private String _id;

    @GeoIndexed(geoJson = true)
    private GeoJson geometry;

    private String type;

    private GadmProperties properties;

    public String get_key() {
        return _key;
    }

    public String get_id() {
        return _id;
    }

    public GeoJson getGeometry() {
        return geometry;
    }

    public void setGeometry(GeoJson geometry) {
        this.geometry = geometry;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public GadmProperties getGadmProperties() {
        return properties;
    }

    public void setGadmProperties(GadmProperties gadmProperties) {
        this.properties = gadmProperties;
    }

}
