package org.cenoteando.repository;

import org.springframework.stereotype.Repository;
import com.arangodb.springframework.repository.ArangoRepository;
import org.cenoteando.models.CommentBucket;

@Repository
public interface CommentBucketRepository extends ArangoRepository<CommentBucket, String> {
    CommentBucket findByCenoteId(String id);
}