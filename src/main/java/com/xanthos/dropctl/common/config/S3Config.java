package com.xanthos.dropctl.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class S3Config {

    @Bean
    public S3Client s3Client(StorageProperties properties) {
        AwsCredentialsProvider credentials = properties.hasStaticCredentials()
                ? StaticCredentialsProvider.create(
                AwsBasicCredentials.create(properties.accessKey(), properties.secretKey()))
                : DefaultCredentialsProvider.create();

        return S3Client.builder()
                .region(Region.of(properties.region()))
                .credentialsProvider(credentials)
                .build();
    }
}