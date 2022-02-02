package org.cenoteando.repository;

import com.arangodb.springframework.annotation.Query;
import com.arangodb.springframework.core.geo.GeoJson;
import org.springframework.stereotype.Repository;
import com.arangodb.springframework.repository.ArangoRepository;
import org.cenoteando.models.Gadm;

import java.util.List;


@Repository
public interface GadmRepository extends ArangoRepository<Gadm, String> {

    /*
    @Query("FOR c IN Gadm FILTER c.properties.ENGTYPE_1 == @0 RETURN c")
    Iterable<Gadm> findByState(String state);

    @Query("FOR c IN Gadm FILTER c.properties.ENGTYPE_2 == @0 RETURN c")
    Iterable<Gadm> findByMunicipalities(String municipalities);
*/
    @Query("FOR c IN Gadm FILTER c.properties.TYPE_2 GEO_CONTAINS(c.geometry, @geometry) RETURN c")
    Gadm findGadm(GeoJson geometry);

}