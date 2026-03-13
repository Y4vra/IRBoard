package com.y4vra.irboardbackend.domain.model;

import com.y4vra.irboardbackend.domain.model.enums.ComparisonOperator;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Entity
@DiscriminatorValue("NFR")
public class NonFunctionalRequirement extends Requirement {
    
    private String measurementUnit;

    @Enumerated(EnumType.STRING)
    private ComparisonOperator operator;
    private Double thresholdValue;
    private Double targetValue;
    private Double actualValue;

    @ManyToOne
    private Project project;
}
