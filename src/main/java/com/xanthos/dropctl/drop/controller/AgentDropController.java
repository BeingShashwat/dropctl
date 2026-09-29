package com.xanthos.dropctl.drop.controller;

import com.xanthos.dropctl.common.config.AgentProperties;
import com.xanthos.dropctl.common.config.RateLimitProperties;
import com.xanthos.dropctl.common.exception.InvalidApiKeyException;
import com.xanthos.dropctl.common.ratelimit.RateLimiter;
import com.xanthos.dropctl.common.web.ClientIpResolver;
import com.xanthos.dropctl.drop.dto.DropInfoResponse;
import com.xanthos.dropctl.drop.dto.UploadResponse;
import com.xanthos.dropctl.drop.entity.Drop;
import com.xanthos.dropctl.drop.service.DropService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * Mirrors DropController's endpoints but requires a shared API key.
 * This is the surface meant for MCP servers / agent tooling, kept
 * separate from the public, browser-facing /api/drops routes so
 * neither's rate limit or access model affects the other.
 */
@RestController
@RequestMapping("/api/agent/drops")
@RequiredArgsConstructor
public class AgentDropController {

    private final DropService dropService;
    private final AgentProperties agentProperties;
    private final RateLimiter rateLimiter;
    private final RateLimitProperties rateLimitProperties;
    private final ClientIpResolver clientIpResolver;

    private void requireValidKey(String provided) {
        // Constant-time comparison so response timing can't leak the key byte by byte.
        if (provided == null || !MessageDigest.isEqual(
                provided.getBytes(StandardCharsets.UTF_8),
                agentProperties.apiKey().getBytes(StandardCharsets.UTF_8))) {
            throw new InvalidApiKeyException();
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadResponse> upload(
            @RequestHeader("X-Agent-Api-Key") String apiKey,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "slug", required = false) String slug,
            @RequestParam(value = "expiresInHours", required = false) Integer expiresInHours,
            @RequestParam(value = "isBundle", required = false, defaultValue = "false") boolean isBundle,
            HttpServletRequest request) {
        requireValidKey(apiKey);

        RateLimitProperties.Upload limit = rateLimitProperties.agentUpload();
        rateLimiter.checkLimit("agent-upload:" + clientIpResolver.resolve(request), limit.maxRequests(), limit.window());

        Drop drop = dropService.createDrop(file, slug, expiresInHours, isBundle);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(UploadResponse.from(drop, dropService.shareUrl(drop), dropService.qrCodeDataUri(drop)));
    }

    @GetMapping("/{slug}")
    public DropInfoResponse info(@RequestHeader("X-Agent-Api-Key") String apiKey, @PathVariable String slug) {
        requireValidKey(apiKey);
        return DropInfoResponse.from(dropService.getActiveDrop(slug));
    }

    @GetMapping("/{slug}/file")
    public ResponseEntity<InputStreamResource> download(
            @RequestHeader("X-Agent-Api-Key") String apiKey, @PathVariable String slug) {
        requireValidKey(apiKey);
        Drop drop = dropService.getActiveDrop(slug);
        InputStream stream = dropService.openFile(drop);

        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(drop.getOriginalFileName(), StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(drop.getContentType()))
                .contentLength(drop.getSizeBytes())
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .header("X-Content-Type-Options", "nosniff")
                .cacheControl(CacheControl.noStore())
                .body(new InputStreamResource(stream));
    }
}