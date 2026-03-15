package com.y4vra.irboardbackend.infrastructure.clients;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

@Service
public class KetoClient {

    private final RestTemplate restTemplate;
    private final String ketoReadUrl;

    public KetoClient(@Value("${keto.read.url}") String ketoReadUrl,
                      @Value("${keto.write.url}") String ketoWriteUrl) {
        this.restTemplate = new RestTemplate();
        this.ketoReadUrl = ketoReadUrl;
    }

    public boolean check(String namespace, String object, String relation, String subjectId) {
        String url = UriComponentsBuilder.fromUriString(ketoReadUrl + "/relation-tuples/check")
                .queryParam("namespace", namespace)
                .queryParam("object", object)
                .queryParam("relation", relation)
                .queryParam("subject_id", subjectId)
                .toUriString();

        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            return response != null && (boolean) response.get("allowed");
        } catch (Exception e) {
            return false;
        }
    }

    public List<String> getAuthorizedObjects(String subjectId, String namespace, String relation) {
        String url = UriComponentsBuilder.fromUriString(ketoReadUrl)
                .path("/relation-tuples")
                .queryParam("namespace", namespace)
                .queryParam("relation", relation)
                .queryParam("subject_id", subjectId)
                .build()
                .toUriString();

        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null || !response.containsKey("relation_tuples")) {
                return List.of();
            }

            List<Map<String, Object>> tuples = (List<Map<String, Object>>) response.get("relation_tuples");

            return tuples.stream()
                    .map(t -> t.get("object").toString())
                    .toList();
        } catch (Exception e) {
            return List.of();
        }
    }
}