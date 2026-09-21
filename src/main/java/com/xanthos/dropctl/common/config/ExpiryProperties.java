package com.xanthos.dropctl.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "dropctl.expiry")
public record ExpiryProperties(int defaultHours, int maxHours, int cleanupBatchSize) {

    public ExpiryProperties {
        if (defaultHours < 1 || maxHours < defaultHours) {
            throw new IllegalStateException(
                    "dropctl.expiry: need 1 <= default-hours <= max-hours");
        }
        if (cleanupBatchSize < 1 || cleanupBatchSize > 1000) {
            throw new IllegalStateException(
                    "dropctl.expiry.cleanup-batch-size must be between 1 and 1000");
        }
    }
}