package com.xanthos.dropctl.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "dropctl.expiry")
public record ExpiryProperties(int defaultHours, int maxHours) {

    public ExpiryProperties {
        if (defaultHours < 1 || maxHours < defaultHours) {
            throw new IllegalStateException(
                    "dropctl.expiry: need 1 <= default-hours <= max-hours");
        }
    }
}