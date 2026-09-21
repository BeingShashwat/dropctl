package com.xanthos.dropctl.drop.controller;

import com.xanthos.dropctl.drop.dto.UploadResponse;
import com.xanthos.dropctl.drop.entity.Drop;
import com.xanthos.dropctl.drop.service.DropService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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
}