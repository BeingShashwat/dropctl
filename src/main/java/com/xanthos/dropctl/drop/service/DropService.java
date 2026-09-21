package com.xanthos.dropctl.drop.service;

import com.xanthos.dropctl.common.config.ExpiryProperties;
import com.xanthos.dropctl.common.exception.InvalidExpiryException;
import com.xanthos.dropctl.common.exception.InvalidFileException;
import com.xanthos.dropctl.common.exception.SlugTakenException;
import com.xanthos.dropctl.common.exception.StorageException;
import com.xanthos.dropctl.common.storage.StorageService;
import com.xanthos.dropctl.drop.entity.Drop;
import com.xanthos.dropctl.drop.repository.DropRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DropService {

    private static final int MAX_RANDOM_SLUG_ATTEMPTS = 5;

    private final DropRepository dropRepository;
    private final StorageService storageService;
    private final FileValidator fileValidator;
    private final SlugGenerator slugGenerator;
    private final SlugValidator slugValidator;
    private final ExpiryProperties expiryProperties;

    // Deliberately not @Transactional: no DB transaction should stay open during the
    // S3 upload, and each save attempt must commit or fail on its own so retries work.
    public Drop createDrop(MultipartFile file, String requestedSlug, Integer expiresInHours) {
        FileValidator.ValidatedFile validated = fileValidator.validate(file);
        Duration lifetime = resolveLifetime(expiresInHours);

        String customSlug = (requestedSlug == null || requestedSlug.isBlank())
                ? null
                : slugValidator.validateAndNormalize(requestedSlug);

        if (customSlug != null) {
            ensureSlugAvailable(customSlug); // fail fast, before anything is uploaded
        }

        String storageKey = storeFile(file, validated.contentType());
        try {
            Instant now = Instant.now();
            StoredUpload upload = new StoredUpload(
                    validated.originalFileName(), validated.contentType(), file.getSize(),
                    storageKey, now, now.plus(lifetime));

            return customSlug != null
                    ? saveWithCustomSlug(upload, customSlug)
                    : saveWithRandomSlug(upload);
        } catch (RuntimeException e) {
            deleteStoredFileQuietly(storageKey); // never leave an orphaned object behind
            throw e;
        }
    }

    private Duration resolveLifetime(Integer expiresInHours) {
        int hours = expiresInHours == null ? expiryProperties.defaultHours() : expiresInHours;
        if (hours < 1 || hours > expiryProperties.maxHours()) {
            throw new InvalidExpiryException(
                    "expiresInHours must be between 1 and " + expiryProperties.maxHours());
        }
        return Duration.ofHours(hours);
    }

    /** Throws if the slug is in use by an active drop; frees it if the old drop has expired. */
    private void ensureSlugAvailable(String slug) {
        Optional<Drop> existing = dropRepository.findBySlug(slug);
        if (existing.isEmpty()) {
            return;
        }
        Drop drop = existing.get();
        if (drop.getExpiresAt().isAfter(Instant.now())) {
            throw new SlugTakenException(slug);
        }
        // Expired but not yet cleaned up: file first, then the row.
        storageService.delete(drop.getStorageKey());
        dropRepository.delete(drop);
    }

    private Drop saveWithCustomSlug(StoredUpload upload, String slug) {
        try {
            return dropRepository.saveAndFlush(upload.toDrop(slug));
        } catch (DataIntegrityViolationException e) {
            // Someone else took the slug between our check and the insert.
            // (The unique constraint on slug is the only realistic violation here.)
            throw new SlugTakenException(slug);
        }
    }

    private Drop saveWithRandomSlug(StoredUpload upload) {
        for (int attempt = 1; attempt <= MAX_RANDOM_SLUG_ATTEMPTS; attempt++) {
            try {
                return dropRepository.saveAndFlush(upload.toDrop(slugGenerator.generate()));
            } catch (DataIntegrityViolationException e) {
                log.warn("Random slug collision (attempt {}/{})", attempt, MAX_RANDOM_SLUG_ATTEMPTS);
            }
        }
        throw new IllegalStateException("Could not allocate a unique slug");
    }

    private String storeFile(MultipartFile file, String contentType) {
        try (InputStream in = file.getInputStream()) {
            return storageService.store(in, file.getSize(), contentType);
        } catch (IOException e) {
            throw new InvalidFileException("Could not read the uploaded file");
        }
    }

    private void deleteStoredFileQuietly(String storageKey) {
        try {
            storageService.delete(storageKey);
        } catch (StorageException e) {
            log.error("Orphaned object left in storage, key={}", storageKey, e);
        }
    }

    private record StoredUpload(String originalFileName, String contentType, long sizeBytes,
                                String storageKey, Instant createdAt, Instant expiresAt) {

        Drop toDrop(String slug) {
            Drop drop = new Drop();
            drop.setSlug(slug);
            drop.setOriginalFileName(originalFileName);
            drop.setStorageKey(storageKey);
            drop.setContentType(contentType);
            drop.setSizeBytes(sizeBytes);
            drop.setCreatedAt(createdAt);
            drop.setExpiresAt(expiresAt);
            return drop;
        }
    }
}