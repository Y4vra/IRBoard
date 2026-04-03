package com.y4vra.irboardbackend;

import com.y4vra.irboardbackend.infrastructure.clients.KetoClient;
import com.y4vra.irboardbackend.infrastructure.clients.MinioService;
import io.minio.MinioClient;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
@ActiveProfiles("test")
class IrBoardBackendApplicationTests {

    @MockitoBean
    private KetoClient ketoClient;

    @MockitoBean
    private MinioClient minioClient;

    @MockitoBean
    private MinioService minioService;

    @Test
    void contextLoads() {
    }

}
