package com.xanthos.dropctl.drop.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "drops", indexes = @Index(name = "idx_drops_expires_at", columnList = "expiresAt"))
@Getter
@Setter
@NoArgsConstructor
public class Drop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dropId;

    @Column(nullable = false, unique = true, length = 16)
    private String slug;

    @Column(nullable = false)
    private String originalFileName;

    @Column(nullable = false)
    private String storedFileName;

    private String contentType;

    private long sizeBytes;

    @Column(nullable = false)
    private LocalDateTime uploadedAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;
}
