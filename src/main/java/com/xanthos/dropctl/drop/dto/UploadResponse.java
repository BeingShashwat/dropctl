package com.xanthos.dropctl.drop.dto;

import com.xanthos.dropctl.drop.entity.Drop;

import java.time.Instant;

public record UploadResponse(
        String slug,
        String fileName,
        String contentType,
        long sizeBytes,
        Instant createdAt,
        Instant expiresAt) {

    public static UploadResponse from(Drop drop) {
        return new UploadResponse(
                drop.getSlug(),
                drop.getOriginalFileName(),
                drop.getContentType(),
                drop.getSizeBytes(),
                drop.getCreatedAt(),
                drop.getExpiresAt());
    }
}