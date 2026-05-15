package com.y4vra.irboardbackend.application.dtos.summaries;

public interface RequirementSummary {
    Long id();
    String entityIdentifier();
    String name();
    String description();
    String state();
    String requirementType();
}
