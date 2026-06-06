package com.y4vra.irboardbackend.infrastructure.clients;

import io.minio.GetPresignedObjectUrlArgs;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MinioClientTest {

    @Mock
    private io.minio.MinioClient minioSdkClient;

    private MinioObjectStorageClient minioClient;

    @BeforeEach
    void setUp() {
        minioClient = new MinioObjectStorageClient(minioSdkClient);

        ReflectionTestUtils.setField(
                minioClient,
                "bucketName",
                "test-bucket"
        );
    }

    @Test
    void getDownloadUrl_returnsPresignedUrl() throws Exception {

        when(minioSdkClient.getPresignedObjectUrl(any(GetPresignedObjectUrlArgs.class)))
                .thenReturn("https://minio/file.pdf");

        String result = minioClient.getDownloadUrl("file.pdf");

        assertEquals("https://minio/file.pdf", result);

        verify(minioSdkClient)
                .getPresignedObjectUrl(any(GetPresignedObjectUrlArgs.class));
    }

    @Test
    void getDownloadUrl_wrapsException() throws Exception {

        when(minioSdkClient.getPresignedObjectUrl(any(GetPresignedObjectUrlArgs.class)))
                .thenThrow(new RuntimeException("MinIO down"));

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> minioClient.getDownloadUrl("file.pdf")
        );

        assertEquals("Error generating MinIO URL", ex.getMessage());
        assertNotNull(ex.getCause());
    }

    @Test
    void uploadFile_uploadsSuccessfully() throws Exception {

        InputStream inputStream =
                new ByteArrayInputStream("test".getBytes());

        minioClient.uploadFile(
                "document.pdf",
                inputStream,
                4,
                "application/pdf"
        );

        verify(minioSdkClient)
                .putObject(any(PutObjectArgs.class));
    }

    @Test
    void uploadFile_usesCorrectBucketAndObject() throws Exception {

        InputStream inputStream =
                new ByteArrayInputStream("test".getBytes());

        minioClient.uploadFile(
                "document.pdf",
                inputStream,
                4,
                "application/pdf"
        );

        ArgumentCaptor<PutObjectArgs> captor =
                ArgumentCaptor.forClass(PutObjectArgs.class);

        verify(minioSdkClient).putObject(captor.capture());

        PutObjectArgs args = captor.getValue();

        assertEquals("test-bucket", args.bucket());
        assertEquals("document.pdf", args.object());
    }

    @Test
    void uploadFile_wrapsException() throws Exception {

        doThrow(new RuntimeException("Upload failed"))
                .when(minioSdkClient)
                .putObject(any(PutObjectArgs.class));

        InputStream inputStream =
                new ByteArrayInputStream("test".getBytes());

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> minioClient.uploadFile(
                        "document.pdf",
                        inputStream,
                        4,
                        "application/pdf"
                )
        );

        assertEquals("Error uploading file to MinIO", ex.getMessage());
        assertNotNull(ex.getCause());
    }

    @Test
    void deleteFile_deletesSuccessfully() throws Exception {

        minioClient.deleteFile("document.pdf");

        verify(minioSdkClient)
                .removeObject(any(RemoveObjectArgs.class));
    }

    @Test
    void deleteFile_wrapsException() throws Exception {

        doThrow(new RuntimeException("Delete failed"))
                .when(minioSdkClient)
                .removeObject(any(RemoveObjectArgs.class));

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> minioClient.deleteFile("document.pdf")
        );

        assertEquals("Error deleting file from MinIO", ex.getMessage());
        assertNotNull(ex.getCause());
    }
}