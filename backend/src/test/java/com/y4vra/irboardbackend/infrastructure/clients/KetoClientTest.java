package com.y4vra.irboardbackend.infrastructure.clients;

import com.y4vra.irboardbackend.domain.errors.PermissionServiceException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class KetoClientTest {

    @Mock
    private RestTemplate restTemplate;

    private KetoClient ketoClient;

    @BeforeEach
    void setUp() {
        ketoClient = new KetoClient(
                restTemplate,
                "http://keto-read",
                "http://keto-write"
        );
    }

    @Test
    void checkPermission_returnsTrueWhenAllowed() {
        Map<String, Object> response = Map.of("allowed", true);

        when(restTemplate.getForObject(
                contains("/relation-tuples/check"),
                eq(Map.class)
        )).thenReturn(response);

        boolean result = ketoClient.checkPermission(
                "project",
                "123",
                "view",
                "user1"
        );

        assertTrue(result);
    }

    @Test
    void checkPermission_returnsFalseWhenRequestFails() {
        when(restTemplate.getForObject(anyString(), eq(Map.class)))
                .thenThrow(new RuntimeException());

        boolean result = ketoClient.checkPermission(
                "project",
                "123",
                "view",
                "user1"
        );

        assertFalse(result);
    }

    @Test
    void getAuthorizedObjects_returnsObjects() {
        Map<String, Object> tuple1 = Map.of("object", "obj1");
        Map<String, Object> tuple2 = Map.of("object", "obj2");

        Map<String, Object> response = Map.of(
                "relation_tuples",
                List.of(tuple1, tuple2)
        );

        when(restTemplate.getForObject(anyString(), eq(Map.class)))
                .thenReturn(response);

        List<String> result =
                ketoClient.getAuthorizedObjects(
                        "user1",
                        "project",
                        "view"
                );

        assertEquals(List.of("obj1", "obj2"), result);
    }

    @Test
    void grantPermission_callsPut() {
        ketoClient.grantPermission(
                "project",
                "123",
                "view",
                "user1"
        );

        verify(restTemplate).put(
                eq("http://keto-write/admin/relation-tuples"),
                any(Map.class)
        );
    }

    @Test
    void grantPermission_wrapsException() {
        doThrow(new RuntimeException())
                .when(restTemplate)
                .put(anyString(), any());

        assertThrows(
                PermissionServiceException.class,
                () -> ketoClient.grantPermission(
                        "project",
                        "123",
                        "view",
                        "user1"
                )
        );
    }

    @Test
    void revokePermission_callsDelete() {
        ketoClient.revokePermission(
                "project",
                "123",
                "view",
                "user1"
        );

        verify(restTemplate).delete(
                contains("/admin/relation-tuples")
        );
    }

    @Test
    void getSubjectsForObject_returnsOnlyDirectSubjects() {
        Map<String, Object> direct =
                Map.of("subject_id", "user1");

        Map<String, Object> subjectSet =
                Map.of("subject_set", Map.of());

        Map<String, Object> response = Map.of(
                "relation_tuples",
                List.of(direct, subjectSet)
        );

        when(restTemplate.getForObject(anyString(), eq(Map.class)))
                .thenReturn(response);

        List<String> result =
                ketoClient.getSubjectsForObject(
                        "project",
                        "123",
                        "view"
                );

        assertEquals(List.of("user1"), result);
    }
}