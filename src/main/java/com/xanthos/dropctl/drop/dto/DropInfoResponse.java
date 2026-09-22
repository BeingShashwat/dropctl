package com.xanthos.dropctl.drop.dto;

import com.xanthos.dropctl.drop.entity.Drop;

import java.time.Instant;

public record DropInfoResponse(String slug, String fileName, String contentType, long sizeBytes, Instant expiresAt, boolean isBundle) {
    public static DropInfoResponse from(Drop drop){
        return new DropInfoResponse(
                drop.getSlug(),
                drop.getOriginalFileName(),
                drop.getContentType(),
                drop.getSizeBytes(),
                drop.getExpiresAt(),
                drop.isBundle()
        );
    }
}
