package org.cenoteando.repository;

import com.arangodb.springframework.annotation.Query;
import com.arangodb.springframework.repository.ArangoRepository;
import org.cenoteando.models.Cenote;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;

@Repository()
public interface CenotesRepository extends ArangoRepository<Cenote, String>, PagingAndSortingRepository<Cenote, String> {

    Cenote findByArangoId(String id);

    @Query("FOR c IN #collection COLLECT AGGREGATE m = MIN(c.createdAt) RETURN m")
    Date getEarliestCreationDate();

    @Query("FOR c IN #collection " +
            "COLLECT AGGREGATE minLat = MIN(c.geojson.geometry.coordinates[1]), minLng = MIN(c.geojson.geometry.coordinates[0]), maxLat = MAX(c.geojson.geometry.coordinates[1]), maxLng = MAX(c.geojson.geometry.coordinates[0]) " +
            "RETURN { min: { lat: minLat, lng: minLng }, max: { lat: maxLat, lng: maxLng },}")
    Object getBounds();

}