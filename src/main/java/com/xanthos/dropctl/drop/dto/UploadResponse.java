package com.xanthos.dropctl.drop.dto;

import com.xanthos.dropctl.drop.entity.Drop;

import java.time.Instant;

public record UploadResponse(
        String slug,
        String url,
        String qrCode,
        String fileName,
        String contentType,
        long sizeBytes,
        Instant createdAt,
        Instant expiresAt,
        boolean isBundle) {

    public static UploadResponse from(Drop drop, String url, String qrCode) {
        return new UploadResponse(
                drop.getSlug(),
                url,
                qrCode,
                drop.getOriginalFileName(),
                drop.getContentType(),
                drop.getSizeBytes(),
                drop.getCreatedAt(),
                drop.getExpiresAt(),
                drop.isBundle());
    }
}