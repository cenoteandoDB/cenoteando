package org.cenoteando.repository;

import com.arangodb.springframework.annotation.Query;
import com.arangodb.springframework.repository.ArangoRepository;
import java.util.List;
import org.cenoteando.models.Variable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public interface VariablesRepository
    extends ArangoRepository<Variable, String> {
    Variable findByArangoId(String id);
    Page<Variable> findAll(Pageable page);
    List<Variable> findByTheme(String theme);

    @Query(
        "FOR c IN #collection FILTER c.theme == @theme AND c.accessLevel == 'PUBLIC' RETURN c"
    )
    Iterable<Variable> findByThemeAndPublicVariables(String theme);
}
