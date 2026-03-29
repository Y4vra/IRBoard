package com.y4vra.irboardbackend.application.dtos;

import com.y4vra.irboardbackend.domain.model.enums.ComparisonOperator;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class NonFunctionalRequirementDTO implements Serializable {
    private Long id;
    private String name;
    private String description;
    private String measurementUnit;
    private String operator;
    private Double thresholdValue;
    private Double targetValue;
    private Double actualValue;
    private long projectId;
}