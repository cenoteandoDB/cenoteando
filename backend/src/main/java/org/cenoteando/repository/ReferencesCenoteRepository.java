package org.cenoteando.repository;

import com.arangodb.springframework.annotation.Query;
import com.arangodb.springframework.repository.ArangoRepository;
import java.util.List;
import org.cenoteando.models.CenoteReferences;
import org.springframework.stereotype.Repository;

@Repository
public interface ReferencesCenoteRepository
    extends ArangoRepository<CenoteReferences, String> {
    @Query("FOR c IN #collection FILTER c._from == @id RETURN c")
    List<CenoteReferences> findByReference(String id);

    @Query("FOR c IN #collection FILTER c._to == @id RETURN c")
    List<CenoteReferences> findByCenote(String id);
}
