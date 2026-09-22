package com.xanthos.dropctl.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "dropctl.proxy")
public record ProxyProperties(boolean trustForwardedHeaders) {
}
