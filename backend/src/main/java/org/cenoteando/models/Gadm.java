package org.cenoteando.models;

import com.arangodb.springframework.annotation.ArangoId;
import com.arangodb.springframework.annotation.Document;
import com.arangodb.springframework.annotation.GeoIndexed;
import com.arangodb.springframework.core.geo.GeoJson;
import java.util.ArrayList;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;

@Document("Gadm")
@Getter
@Setter
public class Gadm {

    @Id
    private String _key;

    @ArangoId
    private String _id;

    @GeoIndexed(geoJson = true)
    private GeoJson<ArrayList<Double>> geometry;

    private String type;

    private GadmProperties properties;

}
