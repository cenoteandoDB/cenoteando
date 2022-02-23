package org.cenoteando.repository;

import com.arangodb.springframework.repository.ArangoRepository;

import org.cenoteando.models.Reference;
import org.springframework.stereotype.Repository;

@Repository
public interface ReferenceRepository extends ArangoRepository<Reference, String> {
    Reference findByArangoId(String id);
}