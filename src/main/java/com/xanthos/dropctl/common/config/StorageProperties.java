package com.xanthos.dropctl.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "dropctl.storage")
public record StorageProperties(String bucket, String region, String accessKey, String secretKey) {

    public StorageProperties {
        if (!hasText(bucket)) {
            throw new IllegalStateException("dropctl.storage.bucket must be set");
        }
        if (!hasText(region)) {
            throw new IllegalStateException("dropctl.storage.region must be set");
        }
        if (hasText(accessKey) != hasText(secretKey)) {
            throw new IllegalStateException(
                    "Set both access-key and secret-key, or neither (to use the default AWS credentials chain)");
        }
    }

    public boolean hasStaticCredentials() {
        return hasText(accessKey);
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    @SuppressWarnings("NullableProblems")
    @Override
    public String toString() {
        return "StorageProperties[bucket=" + bucket + ", region=" + region
                + ", credentials=" + (hasStaticCredentials() ? "static" : "default-chain") + "]";
    }
}