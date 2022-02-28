package org.cenoteando.repository;

import com.arangodb.springframework.annotation.Query;
import com.arangodb.springframework.core.geo.GeoJsonPoint;
import com.arangodb.springframework.repository.ArangoRepository;
import org.cenoteando.models.Gadm;
import org.springframework.stereotype.Repository;

@Repository
public interface GadmRepository extends ArangoRepository<Gadm, String> {
    @Query("FOR g IN Gadm FILTER g.properties.NAME_1 == @state RETURN g")
    Iterable<Gadm> findByState(String state);

    @Query("FOR g IN Gadm FILTER g.properties.ENGTYPE_2 == @municipality RETURN g")
    Iterable<Gadm> findByMunicipality(String municipality);

    @Query(
        "FOR g IN Gadm FILTER g.properties.ENGTYPE_1 == \"State\" AND g.properties.NAME_1 IN [\"Yucatán\", \"Campeche\", \"Quintana Roo\"] RETURN g"
    )
    Iterable<Gadm> getStates();

    @Query(
        "FOR g IN Gadm FILTER g.properties.ENGTYPE_2 == \"Municipality\" AND g.properties.NAME_1 IN [\"Yucatán\", \"Campeche\", \"Quintana Roo\"] RETURN g"
    )
    Iterable<Gadm> getMunicipalities();

    @Query(
        "FOR g IN Gadm FILTER g.properties.TYPE_2 GEO_CONTAINS(g.geometry, @geometry) RETURN g"
    )
    Gadm findGadm(GeoJsonPoint geometry);
}
