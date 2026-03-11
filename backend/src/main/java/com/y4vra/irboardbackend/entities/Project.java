package com.y4vra.irboardbackend.entities;

import com.y4vra.irboardbackend.entities.enums.*;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name="project")
public class Project {

    @Id
    @GeneratedValue
    private UUID projectId;

    @Column(unique=true)
    private String name;
    private String description;

    @Enumerated(EnumType.STRING)
    private PriorityStyle priorityStyle;
    @Enumerated(EnumType.STRING)
    private ProjectState state;
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "project")
    private Set<Functionality> functionalities=new HashSet<>();
    @OneToMany(mappedBy = "project")
    private Set<NonFunctionalRequirement> NonFunctionalRequirements=new HashSet<>();
    @OneToMany(mappedBy = "project")
    private Set<Stakeholder> stakeholders = new HashSet<>();
    @OneToMany(mappedBy = "project")
    private Set<Document> documents = new HashSet<>();

    protected Project(){

    }
}
