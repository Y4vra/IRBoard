package com.y4vra.irboardbackend.infrastructure.clients;

import com.y4vra.irboardbackend.domain.errors.IdentityServiceException;
import com.y4vra.irboardbackend.domain.model.User;
import com.y4vra.irboardbackend.infrastructure.api.rest.errors.AccountRecoveryException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Map;

@ExtendWith(MockitoExtension.class)
class KratosClientTest {

    @Mock
    private RestTemplate restTemplate;

    private KratosClient kratosClient;

    @BeforeEach
    void setUp() {
        kratosClient = new KratosClient(
                restTemplate,
                "http://kratos-admin",
                "secret-key",
                "http://kratos-public"
        );
    }
    @Test
    void createIdentity_returnsCreatedId() {
        Map<String, Object> response = Map.of("id", "ory-123");

        when(restTemplate.postForObject(
                eq("http://kratos-admin/admin/identities"),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(response);

        String result = kratosClient.createIdentity(
                "john@test.com",
                "John",
                "Doe",
                false
        );

        assertEquals("ory-123", result);
    }
    @Test
    void createIdentity_returnsExistingIdentityOnConflict() {

        when(restTemplate.postForObject(
                anyString(),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenThrow(HttpClientErrorException.Conflict.create(
                HttpStatus.CONFLICT,
                "Conflict",
                HttpHeaders.EMPTY,
                null,
                null
        ));

        when(restTemplate.getForObject(
                contains("credentials_identifier=john@test.com"),
                eq(List.class)
        )).thenReturn(
                List.of(Map.of("id", "existing-id"))
        );

        String result = kratosClient.createIdentity(
                "john@test.com",
                "John",
                "Doe",
                false
        );

        assertEquals("existing-id", result);
    }
    @Test
    void createIdentity_throwsException() {

        when(restTemplate.postForObject(
                anyString(),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenThrow(new RuntimeException("boom"));

        assertThrows(
                IdentityServiceException.class,
                () -> kratosClient.createIdentity(
                        "john@test.com",
                        "John",
                        "Doe",
                        false
                )
        );
    }
    @Test
    void createIdentity_conflictAndIdentityMissing_throwsException() {

        when(restTemplate.postForObject(
                anyString(),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenThrow(HttpClientErrorException.Conflict.create(
                HttpStatus.CONFLICT,
                "Conflict",
                HttpHeaders.EMPTY,
                null,
                null
        ));

        when(restTemplate.getForObject(anyString(), eq(List.class)))
                .thenReturn(List.of());

        assertThrows(
                IdentityServiceException.class,
                () -> kratosClient.createIdentity(
                        "john@test.com",
                        "John",
                        "Doe",
                        false
                )
        );
    }
    @Test
    void sendInvitationCode_returnsFlowId() {

        when(restTemplate.getForObject(
                eq("http://kratos-public/self-service/recovery/api"),
                eq(Map.class)
        )).thenReturn(Map.of("id", "flow-123"));

        when(restTemplate.postForObject(
                contains("/self-service/recovery?flow=flow-123"),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(Map.of());

        String flowId =
                kratosClient.sendInvitationCode("john@test.com");

        assertEquals("flow-123", flowId);
    }
    @Test
    void sendInvitationCode_throwsException() {

        when(restTemplate.getForObject(anyString(), eq(Map.class)))
                .thenThrow(new RuntimeException());

        assertThrows(
                IdentityServiceException.class,
                () -> kratosClient.sendInvitationCode("john@test.com")
        );
    }
    @Test
    void validateRecoveryCode_success() {

        when(restTemplate.postForEntity(
                anyString(),
                any(),
                eq(String.class)
        )).thenReturn(ResponseEntity.ok("ok"));

        assertDoesNotThrow(() ->
                kratosClient.validateRecoveryCode(
                        "john@test.com",
                        "123456",
                        "flow1"
                ));
    }
    @Test
    void validateRecoveryCode_accepts422() {

        when(restTemplate.postForEntity(
                anyString(),
                any(),
                eq(String.class)
        )).thenThrow(HttpClientErrorException.create(
                HttpStatus.UNPROCESSABLE_ENTITY,
                "422",
                HttpHeaders.EMPTY,
                null,
                null
        ));

        assertDoesNotThrow(() ->
                kratosClient.validateRecoveryCode(
                        "john@test.com",
                        "123456",
                        "flow1"
                ));
    }
    @Test
    void validateRecoveryCode_otherHttpError_throwsAccountRecoveryException() {

        when(restTemplate.postForEntity(
                anyString(),
                any(),
                eq(String.class)
        )).thenThrow(HttpClientErrorException.create(
                HttpStatus.BAD_REQUEST,
                "400",
                HttpHeaders.EMPTY,
                null,
                null
        ));

        assertThrows(
                AccountRecoveryException.class,
                () -> kratosClient.validateRecoveryCode(
                        "john@test.com",
                        "123456",
                        "flow1"
                )
        );
    }
    @Test
    void validateRecoveryCode_genericError_throwsAccountRecoveryException() {

        when(restTemplate.postForEntity(
                anyString(),
                any(),
                eq(String.class)
        )).thenThrow(new RuntimeException());

        assertThrows(
                AccountRecoveryException.class,
                () -> kratosClient.validateRecoveryCode(
                        "john@test.com",
                        "123456",
                        "flow1"
                )
        );
    }
    @Test
    void setPassword_callsKratos() {

        User user = new User();
        user.setEmail("john@test.com");
        user.setName("John");
        user.setSurname("Doe");
        user.setIsAdmin(false);
        user.setOryId("ory-123");

        when(restTemplate.exchange(
                anyString(),
                eq(HttpMethod.PUT),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(ResponseEntity.ok(Map.of()));

        assertDoesNotThrow(() ->
                kratosClient.setPassword(
                        "ory-123",
                        "secret",
                        user
                ));
    }
    @Test
    void disableIdentity_success() {

        when(restTemplate.exchange(
                anyString(),
                eq(HttpMethod.PATCH),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(ResponseEntity.ok(Map.of()));

        assertDoesNotThrow(() ->
                kratosClient.disableIdentity("ory-123"));
    }
    @Test
    void disableIdentity_failure() {

        when(restTemplate.exchange(
                anyString(),
                eq(HttpMethod.PATCH),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenThrow(new RuntimeException());

        assertThrows(
                IdentityServiceException.class,
                () -> kratosClient.disableIdentity("ory-123")
        );
    }

    @Test
    void reenableIdentity_success() {

        when(restTemplate.exchange(
                eq("http://kratos-admin/admin/identities/ory-123"),
                eq(HttpMethod.PATCH),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(ResponseEntity.ok(Map.of()));

        assertDoesNotThrow(() ->
                kratosClient.reenableIdentity("ory-123"));

        verify(restTemplate).exchange(
                eq("http://kratos-admin/admin/identities/ory-123"),
                eq(HttpMethod.PATCH),
                any(HttpEntity.class),
                eq(Map.class)
        );
    }

    @Test
    void reenableIdentity_failure() {

        when(restTemplate.exchange(
                eq("http://kratos-admin/admin/identities/ory-123"),
                eq(HttpMethod.PATCH),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenThrow(new RuntimeException("Kratos unavailable"));

        IdentityServiceException exception = assertThrows(
                IdentityServiceException.class,
                () -> kratosClient.reenableIdentity("ory-123")
        );

        assertEquals("Failed to re-enable identity", exception.getMessage());

        verify(restTemplate).exchange(
                eq("http://kratos-admin/admin/identities/ory-123"),
                eq(HttpMethod.PATCH),
                any(HttpEntity.class),
                eq(Map.class)
        );
    }

    @Test
    void deleteIdentity_success() {

        when(restTemplate.exchange(
                anyString(),
                eq(HttpMethod.DELETE),
                any(HttpEntity.class),
                eq(Void.class)
        )).thenReturn(ResponseEntity.ok().build());

        assertDoesNotThrow(() ->
                kratosClient.deleteIdentity("ory-123"));
    }
    @Test
    void deleteIdentity_notFoundIgnored() {

        when(restTemplate.exchange(
                anyString(),
                eq(HttpMethod.DELETE),
                any(HttpEntity.class),
                eq(Void.class)
        )).thenThrow(HttpClientErrorException.NotFound.create(
                HttpStatus.NOT_FOUND,
                "Not found",
                HttpHeaders.EMPTY,
                null,
                null
        ));

        assertDoesNotThrow(() ->
                kratosClient.deleteIdentity("ory-123"));
    }
    @Test
    void deleteIdentity_otherErrorThrows() {

        when(restTemplate.exchange(
                anyString(),
                eq(HttpMethod.DELETE),
                any(HttpEntity.class),
                eq(Void.class)
        )).thenThrow(new RuntimeException());

        assertThrows(
                IdentityServiceException.class,
                () -> kratosClient.deleteIdentity("ory-123")
        );
    }
}
