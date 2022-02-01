package org.cenoteando.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import com.arangodb.springframework.repository.ArangoRepository;
import org.cenoteando.models.Reference;

@Repository
public interface ReferenceRepository extends ArangoRepository<Reference, String> {

    Reference findByArangoId(String id);
    Page<Reference> findAll(Pageable page);
}