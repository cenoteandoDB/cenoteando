package org.cenoteando.repository;

import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;
import com.arangodb.springframework.repository.ArangoRepository;
import org.cenoteando.models.Reference;

@Repository
public interface ReferenceRepository extends ArangoRepository<Reference, String>, PagingAndSortingRepository<Reference, String> {
    Reference findByArangoId(String id);
}