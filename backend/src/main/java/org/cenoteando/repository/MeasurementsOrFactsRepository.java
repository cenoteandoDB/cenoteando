package org.cenoteando.repository;

import com.arangodb.springframework.annotation.Query;
import org.springframework.stereotype.Repository;
import com.arangodb.springframework.repository.ArangoRepository;
import org.cenoteando.models.MeasurementOrFact;
import org.cenoteando.models.MeasurementOrFactBucket;

import java.util.List;


@Repository
public interface MeasurementsOrFactsRepository extends ArangoRepository<MeasurementOrFactBucket, String> {

    MeasurementOrFactBucket findByArangoId(String id);

    @Query("FOR c IN #collection FILTER c._to == @cenoteid and c._from in @variables RETURN c")
    Iterable<MeasurementOrFactBucket> findMeasurementsOrFacts(String cenoteid, List<String> variables);

}
