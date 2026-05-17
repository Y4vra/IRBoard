package com.y4vra.irboardbackend.domain.service;

import com.y4vra.irboardbackend.domain.model.*;
import com.y4vra.irboardbackend.domain.model.enums.EntitySlugType;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

public class EntitySlugGenerator {
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");

    private static String suffix() {
        return LocalDateTime.now().format(FMT) + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    public static void setSlug(NonFunctionalRequirement r, Long projectId) {
        r.setEntityIdentifier(projectId + "-"+ EntitySlugType.NFR.name() +"-" + suffix());
    }

    public static void setSlug(FunctionalRequirement r, Long projectId) {
        r.setEntityIdentifier(projectId + "-"+ EntitySlugType.FR.name() +"-" + suffix());
    }

    public static void setSlug(Document d, Long projectId) {
        d.setEntityIdentifier(projectId + "-"+ EntitySlugType.DOC.name() +"-" + suffix());
    }

    public static void setSlug(Stakeholder s, Long projectId) {
        s.setEntityIdentifier(projectId + "-"+ EntitySlugType.STKH.name() +"-" + suffix());
    }

    public static void setSlug(Functionality f, Long projectId) {
        f.setEntityIdentifier(projectId + "-"+ EntitySlugType.FUNC.name() +"-" + suffix());
    }
}
