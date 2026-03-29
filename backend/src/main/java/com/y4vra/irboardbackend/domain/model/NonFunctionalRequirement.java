package com.y4vra.irboardbackend.domain.model;

import com.y4vra.irboardbackend.domain.model.enums.ComparisonOperator;
import jakarta.persistence.*;

@Entity
@DiscriminatorValue("NFR")
public class NonFunctionalRequirement extends Requirement {

    private String measurementUnit;

    @Enumerated(EnumType.STRING)
    private ComparisonOperator operator;

    private Double thresholdValue;
    private Double targetValue;
    private Double actualValue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    public NonFunctionalRequirement() {}

    public String getMeasurementUnit() { return measurementUnit; }
    public void setMeasurementUnit(String measurementUnit) { this.measurementUnit = measurementUnit; }

    public ComparisonOperator getOperator() { return operator; }
    public void setOperator(ComparisonOperator operator) { this.operator = operator; }

    public Double getThresholdValue() { return thresholdValue; }
    public void setThresholdValue(Double thresholdValue) { this.thresholdValue = thresholdValue; }

    public Double getTargetValue() { return targetValue; }
    public void setTargetValue(Double targetValue) { this.targetValue = targetValue; }

    public Double getActualValue() { return actualValue; }
    public void setActualValue(Double actualValue) { this.actualValue = actualValue; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

}