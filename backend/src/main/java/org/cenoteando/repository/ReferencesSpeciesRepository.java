package org.cenoteando.repository;

import com.arangodb.springframework.annotation.Query;
import com.arangodb.springframework.repository.ArangoRepository;
import java.util.List;
import org.cenoteando.models.SpeciesReferences;
import org.springframework.stereotype.Repository;

@Repository
public interface ReferencesSpeciesRepository
    extends ArangoRepository<SpeciesReferences, String> {
    @Query("FOR c IN #collection FILTER c._from == @id RETURN c")
    List<SpeciesReferences> findByReference(String id);

    @Query("FOR c IN #collection FILTER c._to == @id RETURN c")
    List<SpeciesReferences> findBySpecies(String id);
}
