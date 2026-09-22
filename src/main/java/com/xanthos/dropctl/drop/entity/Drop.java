package com.xanthos.dropctl.drop.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "drops")
@Getter
@Setter
@NoArgsConstructor
public class Drop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dropId;

    @Column(nullable = false, updatable = false, length = 32)
    private String slug;

    @Column(nullable = false, updatable = false)
    private String originalFileName;

    @Column(nullable = false, updatable = false)
    private String storageKey;

    @Column(nullable = false, updatable = false)
    private String contentType;

    @Column(nullable = false, updatable = false)
    private long sizeBytes;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column(nullable = false, updatable = false)
    private boolean isBundle;
}