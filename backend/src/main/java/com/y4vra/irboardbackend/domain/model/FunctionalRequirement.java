package com.y4vra.irboardbackend.domain.model;


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
@DiscriminatorValue("FR")
public class FunctionalRequirement extends Requirement {
    
    private String priority;
    private String stability;

    @ManyToOne
    private Functionality functionality;
}
