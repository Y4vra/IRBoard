package com.y4vra.irboardbackend.application.dtos.summaries;

public interface RequirementSummary {
    Long id();
    String name();
    String description();
    String state();
    String requirementType();
}
