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

    @Query(
        "FOR c IN #collection FILTER c._to == @cenoteId and c._from == @variableId RETURN c"
    )
    MeasurementOrFactBucket findMof(String cenoteId, String variableId);

    @Query(
        "FOR mof IN #collection " +
        "FOR measure in mof.measurements " +
        "RETURN [mof._from, mof._to, measure.timestamp, measure.value]"
    )
    Iterable<Object> findMofs();

    @Query(
        "FOR mof IN #collection " +
        "FILTER mof._to == @cenoteId " +
        "FOR measure in mof.measurements " +
        "RETURN [mof._from, mof._to, measure.timestamp, measure.value]"
    )
    Iterable<Object> findMofsByCenote(String cenoteId);
}
