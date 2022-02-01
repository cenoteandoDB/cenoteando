package org.cenoteando.repository;

import com.arangodb.springframework.repository.ArangoRepository;
import org.cenoteando.models.Cenote;
import org.cenoteando.models.Variable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VariablesRepository extends ArangoRepository<Variable, String>, PagingAndSortingRepository<Variable, String> {

    Variable findByArangoId(String id);
    Page<Variable> findAll(Pageable page);
    Iterable<Variable> findByTheme(String theme);
}