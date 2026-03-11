package com.y4vra.irboardbackend.domain.model;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
public class User {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(unique=true)
    private String email;

    private String nombre;
    private String apellido;

    @ManyToOne
    private Project project;
    @ManyToMany(mappedBy = "requirementEngineers")
    private Set<Functionality> engineerFunctionalities= new HashSet<>();
    @ManyToMany(mappedBy = "stakeholders")
    private Set<Stakeholder> stakeholderFunctionalities = new HashSet<>();
}
