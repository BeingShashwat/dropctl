package com.xanthos.dropctl.common.storage;

import com.xanthos.dropctl.common.config.StorageProperties;
import com.xanthos.dropctl.common.exception.StorageException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.ServerSideEncryption;

import java.io.InputStream;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3StorageService implements StorageService {

    private static final String KEY_PREFIX = "drops/";

    private final S3Client s3Client;
    private final StorageProperties properties;

    /** Fail fast: never start with broken credentials or a missing bucket. */
    @PostConstruct
    void verifyBucketAccess() {
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(properties.bucket()).build());
            log.info("S3 bucket '{}' is reachable", properties.bucket());
        } catch (SdkException e) {
            throw new IllegalStateException(
                    "Cannot access S3 bucket '" + properties.bucket() + "': " + e.getMessage(), e);
        }
    }

    @Override
    public String store(InputStream content, long sizeBytes, String contentType) {
        String key = KEY_PREFIX + UUID.randomUUID();
        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(properties.bucket())
                            .key(key)
                            .contentType(contentType)
                            .serverSideEncryption(ServerSideEncryption.AES256)
                            .build(),
                    RequestBody.fromInputStream(content, sizeBytes));
            return key;
        } catch (SdkException e) {
            throw new StorageException("Could not store file", e);
        }
    }

    @Override
    public InputStream load(String key) {
        try {
            return s3Client.getObject(
                    GetObjectRequest.builder().bucket(properties.bucket()).key(key).build());
        } catch (NoSuchKeyException e) {
            throw new StorageException("Stored file not found", e);
        } catch (SdkException e) {
            throw new StorageException("Could not read file", e);
        }
    }

    @Override
    public void delete(String key) {
        try {
            s3Client.deleteObject(
                    DeleteObjectRequest.builder().bucket(properties.bucket()).key(key).build());
        } catch (SdkException e) {
            throw new StorageException("Could not delete file", e);
        }
    }
}