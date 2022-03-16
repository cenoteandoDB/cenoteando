package org.cenoteando.repository;

import com.arangodb.springframework.annotation.Query;
import com.arangodb.springframework.repository.ArangoRepository;
import java.util.List;
import org.cenoteando.models.MeasurementOrFactBucket;
import org.springframework.stereotype.Repository;

@Repository
public interface MeasurementsOrFactsRepository
    extends ArangoRepository<MeasurementOrFactBucket<Object>, String> {
    MeasurementOrFactBucket<Object> findByArangoId(String id);

    @Query(
        "FOR c IN #collection FILTER c._to == @cenoteid and c._from in @variables RETURN c"
    )
    Iterable<MeasurementOrFactBucket<Object>> findMeasurementsOrFacts(
        String cenoteid,
        List<String> variables
    );
}
