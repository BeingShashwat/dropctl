package com.xanthos.dropctl.drop.repository;

import com.xanthos.dropctl.drop.entity.Drop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DropRepository extends JpaRepository<Drop, Long> {
    Optional<Drop> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
