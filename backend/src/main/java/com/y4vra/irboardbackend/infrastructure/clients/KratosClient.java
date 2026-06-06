package com.y4vra.irboardbackend.infrastructure.clients;

import com.y4vra.irboardbackend.application.ports.IdentityService;
import com.y4vra.irboardbackend.domain.errors.IdentityServiceException;
import com.y4vra.irboardbackend.domain.model.User;
import com.y4vra.irboardbackend.infrastructure.api.rest.errors.AccountRecoveryException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class KratosClient implements IdentityService {

    private final RestTemplate restTemplate;
    private final String kratosAdminUrl;
    private final String kratosPublicUrl;
    private final String apiKey;

    public KratosClient(RestTemplate restTemplate,
                        @Value("${kratos.admin.url}") String kratosAdminUrl,
                        @Value("${kratos.admin.api.key}") String apiKey,
                        @Value("${kratos.public.url}") String kratosPublicUrl) {
        this.restTemplate = restTemplate;
        this.kratosAdminUrl = kratosAdminUrl;
        this.apiKey = apiKey;
        this.kratosPublicUrl=kratosPublicUrl;
    }

    public String createIdentity(String email, String name, String surname, boolean isAdmin) {
        String url = kratosAdminUrl + "/admin/identities";

        Map<String, Object> traits = new HashMap<>();
        traits.put("email", email);
        traits.put("name", name);
        traits.put("surname", surname);
        traits.put("is_admin", isAdmin);

        Map<String, Object> body = new HashMap<>();
        body.put("schema_id", "default");
        body.put("state", "active");
        body.put("traits", traits);

        Map<String, Object> recoveryAddress = new HashMap<>();
        recoveryAddress.put("value", email);
        recoveryAddress.put("via", "email");
        body.put("recovery_addresses", List.of(recoveryAddress));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, createHeaders());

        try {
            Map<?, ?> response = restTemplate.postForObject(url, request, Map.class);
            return (String) response.get("id");
        } catch (org.springframework.web.client.HttpClientErrorException.Conflict e) {
            // If 409 Conflict, fetch the existing identity by email
            return getIdentityIdByEmail(email);
        } catch (Exception e) {
            throw new IdentityServiceException("Identity creation failed: " + e.getMessage(), e);
        }
    }

    private String getIdentityIdByEmail(String email) {
        String url = kratosAdminUrl + "/admin/identities?credentials_identifier=" + email;
        try {
            List<?> response = restTemplate.getForObject(url, List.class);
            if (response != null && !response.isEmpty()) {
                Map<?, ?> identity = (Map<?, ?>) response.get(0);
                return (String) identity.get("id");
            }
            throw new IdentityServiceException("Identity exists in Kratos but could not be retrieved");
        } catch (Exception e) {
            throw new IdentityServiceException("Failed to retrieve existing identity from Kratos", e);
        }
    }

    public String sendInvitationCode(String email) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            String initUrl = kratosPublicUrl + "/self-service/recovery/api";
            Map<String, Object> flow = restTemplate.getForObject(initUrl, Map.class);
            String flowId = (String) flow.get("id");

            String submitUrl = kratosPublicUrl + "/self-service/recovery?flow=" + flowId;
            Map<String, Object> body = Map.of(
                    "method", "code",
                    "email", email
            );

            HttpEntity<Map<String, Object>> submitRequest = new HttpEntity<>(body, headers);
            restTemplate.postForObject(submitUrl, submitRequest, Map.class);

            return flowId;
        } catch (Exception e) {
            throw new IdentityServiceException("Failed to trigger recovery email for: " + email, e);
        }
    }

    public void validateRecoveryCode(String email, String code, String flowId) {
        try {
            String submitUrl = kratosPublicUrl + "/self-service/recovery?flow=" + flowId;
            Map<String, Object> body = Map.of(
                    "method", "code",
                    "code", code
            );

            restTemplate.postForEntity(submitUrl, body, String.class);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            if (e.getStatusCode().value() == 422) {
                return; // valid code, flow advanced — this is expected Kratos behavior
            }
            throw new AccountRecoveryException("INVALID_OR_EXPIRED_CODE",e);
        } catch (Exception e) {
            throw new AccountRecoveryException("INVALID_OR_EXPIRED_CODE",e);
        }
    }

    public void setPassword(String oryId, String password, User user) {
        String url = kratosAdminUrl + "/admin/identities/" + oryId;

        Map<String, Object> traits = new HashMap<>();
        traits.put("email", user.getEmail());
        traits.put("name", user.getName());
        traits.put("surname", user.getSurname());
        traits.put("is_admin", user.getIsAdmin());

        Map<String, Object> passwordConfig = Map.of("password", password);
        Map<String, Object> passwordCredential = Map.of(
                "type", "password",
                "config", passwordConfig
        );

        Map<String, Object> body = Map.of(
                "schema_id", "default",
                "state", "active",
                "traits", traits,
                "credentials", Map.of("password", passwordCredential)
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, createHeaders());
        restTemplate.exchange(url, HttpMethod.PUT, request, Map.class);
    }

    public void disableIdentity(String oryId) {
        String url = kratosAdminUrl + "/admin/identities/" + oryId;

        Map<String, Object> body = Map.of("state", "inactive");
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, createHeaders());

        try {
            restTemplate.exchange(url, HttpMethod.PATCH, request, Map.class);
        } catch (Exception e) {
            throw new IdentityServiceException("Failed to disable identity", e);
        }
    }
    public void reenableIdentity(String oryId) {
        String url = kratosAdminUrl + "/admin/identities/" + oryId;

        Map<String, Object> body = Map.of("state", "active");
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, createHeaders());

        try {
            restTemplate.exchange(url, HttpMethod.PATCH, request, Map.class);
        } catch (Exception e) {
            throw new IdentityServiceException("Failed to re-enable identity", e);
        }
    }
    public void deleteIdentity(String oryId) {
        String url = kratosAdminUrl + "/admin/identities/" + oryId;
        HttpEntity<Void> request = new HttpEntity<>(createHeaders());

        try {
            restTemplate.exchange(url, HttpMethod.DELETE, request, Void.class);
        } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {
            // Identity already gone = success, deletion is idempotent
        } catch (Exception e) {
            throw new IdentityServiceException("Failed to delete identity from Kratos for oryId: " + oryId, e);
        }
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (apiKey != null && !apiKey.isEmpty()) {
            headers.set("Authorization", "Bearer " + apiKey);
        }
        return headers;
    }
}