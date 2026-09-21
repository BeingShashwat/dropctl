package com.xanthos.dropctl.drop.repository;

import com.xanthos.dropctl.drop.entity.Drop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface DropRepository extends JpaRepository<Drop, Long> {
    Optional<Drop> findBySlug(String slug);

    boolean existsBySlug(String slug);

    /**
     * Must be called inside a transaction: the row locks are held until it ends.
     * SKIP LOCKED lets several instances work on different rows at the same time.
     */
    @Query(value = """
        SELECT * FROM drops
        WHERE expires_at < :cutoff
        ORDER BY expires_at
        LIMIT :batchSize
        FOR UPDATE SKIP LOCKED
        """, nativeQuery = true)
    List<Drop> lockExpiredBatch(@Param("cutoff") Instant cutoff, @Param("batchSize") int batchSize);
}
