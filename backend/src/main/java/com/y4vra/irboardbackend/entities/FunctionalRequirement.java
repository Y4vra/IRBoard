package com.y4vra.irboardbackend.entities;


import jakarta.persistence.*;

@Entity
@DiscriminatorValue("FR")
public class FunctionalRequirement extends Requirement {
    
    private String priority;
    private String stability;

    @ManyToOne
    private Functionality functionality;
}
