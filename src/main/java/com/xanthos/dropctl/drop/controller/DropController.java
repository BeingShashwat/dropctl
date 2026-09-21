package com.xanthos.dropctl.drop.controller;

import com.xanthos.dropctl.drop.dto.DropInfoResponse;
import com.xanthos.dropctl.drop.dto.UploadResponse;
import com.xanthos.dropctl.drop.entity.Drop;
import com.xanthos.dropctl.drop.service.DropService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/drops")
@RequiredArgsConstructor
public class DropController {

    private final DropService dropService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "slug", required = false) String slug,
            @RequestParam(value = "expiresInHours", required = false) Integer expiresInHours) {

        Drop drop = dropService.createDrop(file, slug, expiresInHours);
        return ResponseEntity.status(HttpStatus.CREATED).body(UploadResponse.from(drop));
    }

    @GetMapping("/{slug}")
    public DropInfoResponse info(@PathVariable String slug) {
        return DropInfoResponse.from(dropService.getActiveDrop(slug));
    }

    @GetMapping("/{slug}/file")
    public ResponseEntity<InputStreamResource> download(@PathVariable String slug) {
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