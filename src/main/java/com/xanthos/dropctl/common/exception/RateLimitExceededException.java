package com.xanthos.dropctl.common.exception;

import java.time.Duration;

public class RateLimitExceededException extends RuntimeException {

    private final long retryAfterSeconds;

    public RateLimitExceededException(Duration retryAfter) {
        super("Too many requests. Try again later.");
        this.retryAfterSeconds = Math.max(1, retryAfter.toSeconds());
    }

    public long retryAfterSeconds() {
        return retryAfterSeconds;
    }
}