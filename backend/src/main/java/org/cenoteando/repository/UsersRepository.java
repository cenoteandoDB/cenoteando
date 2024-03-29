package org.cenoteando.repository;

import com.arangodb.springframework.repository.ArangoRepository;
import org.cenoteando.models.User;
import org.springframework.stereotype.Repository;

@Repository
public interface UsersRepository extends ArangoRepository<User, String> {
    User findByArangoId(String id);
    User findByEmail(String email);
    Boolean existsByEmail(String email);
}
