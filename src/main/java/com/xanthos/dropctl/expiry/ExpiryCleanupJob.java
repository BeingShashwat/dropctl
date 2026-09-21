package com.xanthos.dropctl.expiry;

import com.xanthos.dropctl.common.config.ExpiryProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor
public class ExpiryCleanupJob {

    private final ExpiryCleanupService cleanupService;
    private final ExpiryProperties expiryProperties;

    // fixedDelay: the next run starts only after the previous one finished.
    @Scheduled(initialDelay = 30_000, fixedDelayString = "${dropctl.expiry.cleanup-interval}")
    public void run() {
        int totalDeleted = 0;
        try {
            ExpiryCleanupService.BatchResult result;
            do {
                result = cleanupService.cleanupBatch();
                totalDeleted += result.deleted();
            } while (result.deleted() > 0 && result.locked() == expiryProperties.cleanupBatchSize());
        } catch (Exception e) {
            log.error("Expiry cleanup run failed", e);
        }
        if (totalDeleted > 0) {
            log.info("Expiry cleanup removed {} expired drops", totalDeleted);
        }
    }
}