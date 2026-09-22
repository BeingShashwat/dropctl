package com.xanthos.dropctl.common.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Extends ResponseEntityExceptionHandler so Spring's own errors (oversized upload, missing 'file' part, wrong media type, bad parameter types) also come back as clean ProblemDetail responses.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler({InvalidSlugException.class, InvalidFileException.class, InvalidExpiryException.class})
    public ProblemDetail handleBadRequest(RuntimeException ex) {
        return problem(HttpStatus.BAD_REQUEST, "Invalid request", ex.getMessage());
    }

    @ExceptionHandler(UnsupportedFileTypeException.class)
    public ProblemDetail handleUnsupportedType(UnsupportedFileTypeException ex) {
        return problem(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Unsupported file type", ex.getMessage());
    }

    @ExceptionHandler(SlugTakenException.class)
    public ProblemDetail handleSlugTaken(SlugTakenException ex) {
        return problem(HttpStatus.CONFLICT, "Slug already in use", ex.getMessage());
    }

    @ExceptionHandler(StorageException.class)
    public ProblemDetail handleStorage(StorageException ex) {
        log.error("Storage failure", ex);
        return problem(HttpStatus.SERVICE_UNAVAILABLE, "Storage unavailable",
                "File storage is temporarily unavailable. Please try again.");
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleUnexpected(Exception ex) {
        log.error("Unhandled exception", ex);
        return problem(HttpStatus.INTERNAL_SERVER_ERROR, "Internal error",
                "Something went wrong.");
    }

    private ProblemDetail problem(HttpStatus status, String title, String detail) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setTitle(title);
        return problem;
    }

    @ExceptionHandler(DropNotFoundException.class)
    public ProblemDetail handleNotFound(DropNotFoundException ex) {
        return problem(HttpStatus.NOT_FOUND, "Drop not found", ex.getMessage());
    }

    @ExceptionHandler(DropExpiredException.class)
    public ProblemDetail handleExpired(DropExpiredException ex) {
        return problem(HttpStatus.GONE, "Drop expired", ex.getMessage());
    }

    @ExceptionHandler(StorageObjectNotFoundException.class)
    public ProblemDetail handleMissingObject(StorageObjectNotFoundException ex) {
        log.error("Drop row exists but its stored object is missing", ex);
        return problem(HttpStatus.NOT_FOUND, "Drop not found", "Drop not found");
    }

    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<ProblemDetail> handleRateLimit(RateLimitExceededException ex) {
        ProblemDetail problem = problem(HttpStatus.TOO_MANY_REQUESTS, "Too many requests", ex.getMessage());
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header(HttpHeaders.RETRY_AFTER, String.valueOf(ex.retryAfterSeconds()))
                .body(problem);
    }
}