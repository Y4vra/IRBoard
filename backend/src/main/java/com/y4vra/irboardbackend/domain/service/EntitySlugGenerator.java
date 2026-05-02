package com.y4vra.irboardbackend.domain.service;

import com.y4vra.irboardbackend.domain.model.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class EntitySlugGenerator {
    public static void setSlug(NonFunctionalRequirement requirement, Long projectId) {
        requirement.setEntityIdentifier(projectId+"-NFR-"+LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmm")));
    }
    public static void setSlug(FunctionalRequirement requirement, Long projectId){
        requirement.setEntityIdentifier(projectId +"-FR-" +LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmm")));
    }
    public static void setSlug(Document d, Long projectId){
        d.setEntityIdentifier(projectId+"-DOC-"+ LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmm")));
    }
    public static void setSlug(Stakeholder s, Long projectId){
        s.setEntityIdentifier(projectId+"-STKH-"+ LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmm")));
    }
    public static void setSlug(Functionality f, Long projectId){
        f.setEntityIdentifier(projectId+"-FUNC-"+ LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmm")));
    }
}
