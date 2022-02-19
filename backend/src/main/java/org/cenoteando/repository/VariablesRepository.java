package org.cenoteando.repository;

import com.arangodb.springframework.annotation.Query;
import com.arangodb.springframework.repository.ArangoRepository;
import org.cenoteando.models.Cenote;
import org.cenoteando.models.Variable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VariablesRepository extends ArangoRepository<Variable, String>, PagingAndSortingRepository<Variable, String> {

    Variable findByArangoId(String id);
    Page<Variable> findAll(Pageable page);
    List<Variable> findByTheme(String theme);

    @Query("FOR c IN #collection FILTER c.theme == @theme AND c.accessLevel == 'PUBLIC' RETURN c")
    Iterable<Variable> findByThemeAndPublicVariables(String theme);
}