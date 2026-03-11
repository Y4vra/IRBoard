package com.y4vra.irboardbackend.entities;

import com.y4vra.irboardbackend.entities.enums.FunctionalityState;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
public class Functionality {

    @Id
    @GeneratedValue
    private UUID id;
    @Column(unique=true)
    private String name;
    private String label;

    @Enumerated(EnumType.STRING)
    private FunctionalityState state;

    @OneToMany(mappedBy = "functionality",orphanRemoval = true)
    private Set<FunctionalRequirement> Requirements = new HashSet<FunctionalRequirement>();

    @ManyToOne
    private Project project;
}
