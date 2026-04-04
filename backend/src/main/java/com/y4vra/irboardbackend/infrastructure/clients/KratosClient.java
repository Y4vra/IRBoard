package com.y4vra.irboardbackend.infrastructure.clients;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class KratosClient {

    private final RestTemplate restTemplate;
    private final String kratosAdminUrl;
    private final String apiKey;

    public KratosClient(@Value("${KRATOS_ADMIN_URL}") String kratosAdminUrl,
                        @Value("${KRATOS_ADMIN_API_KEY}") String apiKey) {//TODO add the env vars
        this.restTemplate = new RestTemplate();
        this.kratosAdminUrl = kratosAdminUrl;
        this.apiKey = apiKey;
    }

    public String createInvitation(String email) {
        String url = kratosAdminUrl + "/admin/identities";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        Map<String, Object> body = Map.of(
                "schema_id", "default",
                "traits", Map.of("email", email),
                "state", "active"
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);
            return (String) response.get("id");
        } catch (Exception e) {
            throw new RuntimeException("Failed to create identity in Kratos", e);
        }
    }

    public void resendInvitation(String email) {
        String url = kratosAdminUrl + "/admin/recovery/code";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);

        Map<String, String> body = Map.of("email", email);
        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

        try {
            restTemplate.postForObject(url, request, Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate recovery/invitation code in Kratos", e);
        }
    }

    public void disableIdentity(String oryId) {
        String url = kratosAdminUrl + "/admin/identities/" + oryId;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);

        Map<String, Object> body = Map.of("state", "inactive");
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            restTemplate.patchForObject(url, request, Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to disable identity in Kratos", e);
        }
    }
}