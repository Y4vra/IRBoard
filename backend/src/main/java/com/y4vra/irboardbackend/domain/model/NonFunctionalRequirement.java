package com.y4vra.irboardbackend.domain.model;

import com.y4vra.irboardbackend.domain.model.enums.ComparisonOperator;
import jakarta.persistence.*;

import java.util.Objects;

@Entity
@DiscriminatorValue("NFR")
public class NonFunctionalRequirement extends Requirement {

    private String measurementUnit;

    @Enumerated(EnumType.STRING)
    private ComparisonOperator operator;

    private Double thresholdValue;
    private Double targetValue;
    private Double actualValue;

    public boolean isPassing() {
        return switch (operator) {
            case EQUAL_TO -> Objects.equals(actualValue, thresholdValue);
            case NOT_EQUAL_TO -> !Objects.equals(actualValue, thresholdValue);
            case GREATER_THAN -> actualValue > thresholdValue;
            case GREATER_THAN_OR_EQUAL_TO -> actualValue >= thresholdValue;
            case LESS_THAN -> actualValue < thresholdValue;
            case LESS_THAN_OR_EQUAL_TO -> actualValue <= thresholdValue;
            case null -> false;
            default -> false;
        };
    }

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
}