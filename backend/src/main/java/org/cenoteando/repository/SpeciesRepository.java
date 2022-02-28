package org.cenoteando.repository;

import com.arangodb.springframework.repository.ArangoRepository;
import org.cenoteando.models.Species;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public interface SpeciesRepository extends ArangoRepository<Species, String> {
    Page<Species> findAll(Pageable page);
    Species findByArangoId(String id);
    Species findByAphiaId(String alphaId);
}
