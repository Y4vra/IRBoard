package com.y4vra.irboardbackend.domain.model;

import com.y4vra.irboardbackend.domain.model.enums.PriorityStyle;
import com.y4vra.irboardbackend.domain.model.enums.ProjectState;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name="project")
public class Project {

    @Id
    @GeneratedValue
    private long id;

    @Column(unique=true)
    private String name;
    private String description;

    @Enumerated(EnumType.STRING)
    private PriorityStyle priorityStyle;
    @Enumerated(EnumType.STRING)
    private ProjectState state;
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "project")
    @Getter(AccessLevel.NONE)
    private Set<Functionality> functionalities=new HashSet<>();
    @OneToMany(mappedBy = "project")
    @Getter(AccessLevel.NONE)
    private Set<NonFunctionalRequirement> NonFunctionalRequirements=new HashSet<>();
    @OneToMany(mappedBy = "project")
    @Getter(AccessLevel.NONE)
    private Set<Stakeholder> stakeholders = new HashSet<>();
    @OneToMany(mappedBy = "project")
    @Getter(AccessLevel.NONE)
    private Set<Document> documents = new HashSet<>();
    @ManyToMany(mappedBy = "projects")
    @Getter(AccessLevel.NONE)
    private Set<User> projectManagers=new HashSet<>();


    protected Set<User> _getProjectManagers() {
        return projectManagers;
    }
    protected Set<Document> _getDocuments() {
        return documents;
    }
    protected Set<Stakeholder> _getStakeholders() {
        return stakeholders;
    }
    protected Set<NonFunctionalRequirement> _getNonFunctionalRequirements() {
        return NonFunctionalRequirements;
    }
    protected Set<Functionality> _getFunctionalities() {
        return functionalities;
    }

    public Set<User> getProjectManagers() {
        return Set.copyOf(projectManagers);
    }
    public Set<Document> getDocuments() {
        return Set.copyOf(documents);
    }
    public Set<Stakeholder> getStakeholders() {
        return Set.copyOf(stakeholders);
    }
    public Set<NonFunctionalRequirement> getNonFunctionalRequirements() {
        return Set.copyOf(NonFunctionalRequirements);
    }
    public Set<Functionality> getFunctionalities() {
        return Set.copyOf(functionalities);
    }
}
