package com.y4vra.irboardbackend.entities;

import com.y4vra.irboardbackend.entities.enums.RequirementState;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name="requirement_type")
public abstract class Requirement {

    @Id
    @GeneratedValue
    private UUID id;

    private Float orderValue;
    private String name;
    private String description;

    @Enumerated(EnumType.STRING)
    private RequirementState state;
    private Boolean isPendingReview;

    @OneToMany(mappedBy = "parent")
    private Set<Requirement> children= new HashSet<Requirement>();
    @ManyToOne
    private Requirement parent;
}
