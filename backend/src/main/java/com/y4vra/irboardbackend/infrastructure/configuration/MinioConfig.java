package com.y4vra.irboardbackend.infrastructure.configuration;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinioConfig {

    @Value("${minio.url}")
    private String url;

    @Value("${minio.access-key}")
    private String accessKey;

    @Value("${minio.secret-key}")
    private String secretKey;

    @Value("${minio.bucket-name}")
    private String bucketName;

    @Bean
    public MinioClient minioClient() {
        MinioClient client = MinioClient.builder()
                .endpoint(url)
                .credentials(accessKey, secretKey)
                .build();

        initializeBucket(client);
        return client;
    }

    private void initializeBucket(MinioClient client) {
        int maxAttempts = 10;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                boolean exists = client.bucketExists(BucketExistsArgs.builder()
                        .bucket(bucketName)
                        .build());
                if (!exists) {
                    client.makeBucket(MakeBucketArgs.builder()
                            .bucket(bucketName)
                            .build());
                }
                return;
            } catch (Exception e) {
                if (attempt == maxAttempts) {
                    throw new RuntimeException("Could not initialize MinIO bucket after " + maxAttempts + " attempts", e);
                }
                try { Thread.sleep(3000); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
            }
        }
    }
}