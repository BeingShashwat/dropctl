package com.xanthos.dropctl.common.ratelimit;

import com.xanthos.dropctl.common.exception.RateLimitExceededException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;

@Component
@RequiredArgsConstructor
public class RateLimiter {

    private final StringRedisTemplate redisTemplate;

    /**
     * Fixed-window limiter: throws if this key has already been used maxRequests
     * times within the current window. Safe across multiple app instances,
     * since Redis does the counting.
     */
    public void checkLimit(String key, int maxRequests, Duration window) {
        long windowNumber = Instant.now().getEpochSecond() / window.toSeconds();
        String redisKey = "ratelimit:" + key + ":" + windowNumber;

        Long count = redisTemplate.opsForValue().increment(redisKey);
        if (count != null && count == 1L) {
            redisTemplate.expire(redisKey, window);
        }
        if (count != null && count > maxRequests) {
            long elapsedInWindow = Instant.now().getEpochSecond() % window.toSeconds();
            Duration retryAfter = window.minusSeconds(elapsedInWindow);
            throw new RateLimitExceededException(retryAfter);
        }
    }
}