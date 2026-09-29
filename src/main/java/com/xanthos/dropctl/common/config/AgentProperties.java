package com.xanthos.dropctl.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "dropctl.agent")
public record AgentProperties(String apiKey) {
    public AgentProperties {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("dropctl.agent.api-key must be set");
        }
    }
}