package com.y4vra.irboardbackend.domain.model;


import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@DiscriminatorValue("FR")
public class FunctionalRequirement extends Requirement {
    
    private String priority;
    private String stability;

    @ManyToOne
    private Functionality functionality;
}
