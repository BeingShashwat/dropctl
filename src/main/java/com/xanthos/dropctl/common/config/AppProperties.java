package com.xanthos.dropctl.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.net.URI;

@ConfigurationProperties(prefix = "dropctl.app")
public record AppProperties(String baseUrl) {

    public AppProperties {
        if (baseUrl == null || baseUrl.isBlank()) {
            throw new IllegalStateException("dropctl.app.base-url must be set");
        }
        String trimmed = baseUrl.trim();
        URI uri;
        try {
            uri = URI.create(trimmed);
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("dropctl.app.base-url is not a valid URL", e);
        }
        String scheme = uri.getScheme();
        if (uri.getHost() == null || !("http".equals(scheme) || "https".equals(scheme))) {
            throw new IllegalStateException(
                    "dropctl.app.base-url must be an http(s) URL, e.g. https://drop.example.com");
        }
        baseUrl = trimmed.replaceAll("/+$", "");
    }

    /** The link people share: the app address followed by #slug. */
    public String shareUrl(String slug) {
        return baseUrl + "/#" + slug;
    }
}