package com.xanthos.dropctl.expiry;

import com.xanthos.dropctl.common.config.ExpiryProperties;
import com.xanthos.dropctl.common.exception.StorageException;
import com.xanthos.dropctl.common.storage.StorageService;
import com.xanthos.dropctl.drop.entity.Drop;
import com.xanthos.dropctl.drop.repository.DropRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExpiryCleanupService {

    private final DropRepository dropRepository;
    private final StorageService storageService;
    private final ExpiryProperties expiryProperties;

    public record BatchResult(int locked, int deleted) {
    }

    /** Locks one batch of expired drops, then deletes each file first and its row second. */
    @Transactional
    public BatchResult cleanupBatch() {
        List<Drop> batch = dropRepository.lockExpiredBatch(
                Instant.now(), expiryProperties.cleanupBatchSize());

        int deleted = 0;
        for (Drop drop : batch) {
            try {
                storageService.delete(drop.getStorageKey());
                dropRepository.delete(drop);
                deleted++;
            } catch (StorageException e) {
                // Keep the row so the next run retries; carry on with the rest of the batch.
                log.error("Could not delete stored object of an expired drop, key={}",
                        drop.getStorageKey(), e);
            }
        }
        return new BatchResult(batch.size(), deleted);
    }
}