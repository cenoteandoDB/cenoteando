package org.cenoteando.models;

import com.arangodb.springframework.annotation.ArangoId;
import com.arangodb.springframework.annotation.Document;
import com.arangodb.springframework.annotation.GeoIndexed;
import com.arangodb.springframework.core.geo.GeoJson;
import com.arangodb.springframework.core.geo.GeoJsonPolygon;
import org.springframework.data.annotation.Id;

import java.util.HashMap;

class GadmProperties {
    private String GID_0;
    private String NAME_0;
    private String GID_1;
    private String NAME_1;
    private String VARNAME_1;
    private String NL_NAME_1;
    private String TYPE_1;
    private String ENGTYPE_1;
    private String CC_1;
    private String HASC_1;
    private String GID_2;
    private String NAME_2;
    private String VARNAME_2;
    private String NL_NAME_2;
    private String TYPE_2;
    private String ENGTYPE_2;
    private String CC_2;
    private String HASC_2;

    public String getGID_0() {
        return GID_0;
    }

    public String getNAME_0() {
        return NAME_0;
    }

    public String getGID_1() {
        return GID_1;
    }

    public String getNAME_1() {
        return NAME_1;
    }

    public String getVARNAME_1() {
        return VARNAME_1;
    }

    public String getNL_NAME_1() {
        return NL_NAME_1;
    }

    public String getTYPE_1() {
        return TYPE_1;
    }

    public String getENGTYPE_1() {
        return ENGTYPE_1;
    }

    public String getCC_1() {
        return CC_1;
    }

    public String getHASC_1() {
        return HASC_1;
    }

    public String getGID_2() {
        return GID_2;
    }

    public String getNAME_2() {
        return NAME_2;
    }

    public String getVARNAME_2() {
        return VARNAME_2;
    }

    public String getNL_NAME_2() {
        return NL_NAME_2;
    }

    public String getTYPE_2() {
        return TYPE_2;
    }

    public String getENGTYPE_2() {
        return ENGTYPE_2;
    }

    public String getCC_2() {
        return CC_2;
    }

    public String getHASC_2() {
        return HASC_2;
    }
}

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

    /*public GeoJsonPolygon getGeometry() {
        return geometry;
    }*/

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

    public HashMap<String, String> getInfo() {
        HashMap<String, String> info = new HashMap<String, String>();
        info.put("Municipality", getGadmProperties().getGID_2());
        info.put("State", getGadmProperties().getGID_1());
        info.put("id", get_id());
        return info;
    }
}
