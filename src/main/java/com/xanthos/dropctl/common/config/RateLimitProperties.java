package com.xanthos.dropctl.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "dropctl.rate-limit")
public record RateLimitProperties(Upload upload) {

    public record Upload(int maxRequests, Duration window) {
        public Upload {
            if (maxRequests < 1) {
                throw new IllegalStateException("dropctl.rate-limit.upload.max-requests must be >= 1");
            }
            if (window == null || window.isZero() || window.isNegative()) {
                throw new IllegalStateException("dropctl.rate-limit.upload.window must be a positive duration");
            }
        }
    }

    public RateLimitProperties {
        if (upload == null) {
            throw new IllegalStateException("dropctl.rate-limit.upload must be set");
        }
    }
}