package com.xanthos.dropctl.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;
import java.util.Map;

@ConfigurationProperties(prefix = "dropctl.upload")
public record UploadProperties(Map<String, List<String>> allowedTypes) {

    public UploadProperties {
        if (allowedTypes == null || allowedTypes.isEmpty()) {
            throw new IllegalStateException("dropctl.upload.allowed-types must not be empty");
        }
    }
}