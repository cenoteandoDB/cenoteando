package org.cenoteando.repository;

import com.arangodb.springframework.repository.ArangoRepository;
import org.cenoteando.models.CommentBucket;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentBucketRepository
    extends ArangoRepository<CommentBucket, String> {
    CommentBucket findByCenoteId(String id);
}
