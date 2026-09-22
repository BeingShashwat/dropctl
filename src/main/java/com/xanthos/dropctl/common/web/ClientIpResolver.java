package com.xanthos.dropctl.common.web;

import com.xanthos.dropctl.common.config.ProxyProperties;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ClientIpResolver {

    private final ProxyProperties proxyProperties;

    public String resolve(HttpServletRequest request) {
        if (proxyProperties.trustForwardedHeaders()) {
            String cfConnectingIp = request.getHeader("CF-Connecting-IP");
            if (cfConnectingIp != null && !cfConnectingIp.isBlank()) {
                return cfConnectingIp.trim();
            }
            String forwardedFor = request.getHeader("X-Forwarded-For");
            if (forwardedFor != null && !forwardedFor.isBlank()) {
                return forwardedFor.split(",")[0].trim();
            }
        }
        return request.getRemoteAddr();
    }
}