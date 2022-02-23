package org.cenoteando.repository;

import java.util.Date;
import java.util.List;

import com.arangodb.springframework.annotation.Query;
import com.arangodb.springframework.repository.ArangoRepository;

import org.cenoteando.models.Cenote;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository()
public interface CenotesRepository extends ArangoRepository<Cenote, String> {

    Cenote findByArangoId(String id);

    @Query("FOR c IN #collection COLLECT AGGREGATE m = MIN(c.createdAt) RETURN m")
    Date getEarliestCreationDate();

    @Query("FOR c IN #collection " +
            "COLLECT AGGREGATE minLat = MIN(c.geojson.geometry.coordinates[1]), minLng = MIN(c.geojson.geometry.coordinates[0]), maxLat = MAX(c.geojson.geometry.coordinates[1]), maxLng = MAX(c.geojson.geometry.coordinates[0]) " +
            "RETURN { min: { lat: minLat, lng: minLng }, max: { lat: maxLat, lng: maxLng },}")
    Object getBounds();

    Page<Cenote> findCenotesByTouristicIsTrue(Pageable page);

    @Query("FOR c IN #collection FILTER c.id NOT IN @blackList #pageable RETURN c")
    Page<Cenote> findByBlackListFilter(Pageable page, List<String> blackList);

    @Query("FOR c IN #collection FILTER c.touristic == true OR c._key IN @whiteList #pageable RETURN c")
    Page<Cenote> findByWhiteListFilter(Pageable page, List<String> whiteList);

    @Query("FOR c IN #collection FILTER c._key NOT IN @blackList RETURN c")
    Iterable<Cenote> findByBlackListFilterCsv(List<String> blackList);

    Iterable<Cenote> findCenotesByTouristicIsTrue();

}