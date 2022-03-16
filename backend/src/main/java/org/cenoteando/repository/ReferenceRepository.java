package org.cenoteando.repository;

import com.arangodb.springframework.annotation.Query;
import com.arangodb.springframework.repository.ArangoRepository;

import org.cenoteando.models.Reference;
import org.springframework.stereotype.Repository;

@Repository
public interface ReferenceRepository
    extends ArangoRepository<Reference, String> {
    Reference findByArangoId(String id);

    @Query("FOR r IN #collection FILTER r._key == @key RETURN r")
    Reference findByKey(String key);

    @Query("FOR r IN #collection UPDATE r WITH { hasFile: false } IN #collection")
    void unsetAllHasFile();
}
