package com.y4vra.irboardbackend.domain.service;

import com.y4vra.irboardbackend.domain.model.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

public class EntitySlugGenerator {
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");

    private static String suffix() {
        return LocalDateTime.now().format(FMT) + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    public static void setSlug(NonFunctionalRequirement r, Long projectId) {
        r.setEntityIdentifier(projectId + "-NFR-" + suffix());
    }

    public static void setSlug(FunctionalRequirement r, Long projectId) {
        r.setEntityIdentifier(projectId + "-FR-" + suffix());
    }

    public static void setSlug(Document d, Long projectId) {
        d.setEntityIdentifier(projectId + "-DOC-" + suffix());
    }

    public static void setSlug(Stakeholder s, Long projectId) {
        s.setEntityIdentifier(projectId + "-STKH-" + suffix());
    }

    public static void setSlug(Functionality f, Long projectId) {
        f.setEntityIdentifier(projectId + "-FUNC-" + suffix());
    }
}
