package com.y4vra.irboardbackend.domain.service;

import com.y4vra.irboardbackend.domain.model.FunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.NonFunctionalRequirement;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class RequirementIdentificationGenerator {
    public String generateSlugForRequirement(NonFunctionalRequirement requirement){
        return requirement.getProject() +
                "-NFR-" +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmm"));
    }
    public String generateSlugForRequirement(FunctionalRequirement requirement){

        return requirement.getFunctionality().getProject() +
                "-FR-" +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmm"));
    }
}
