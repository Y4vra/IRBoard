package com.y4vra.irboardbackend.domain.model;

import com.y4vra.irboardbackend.domain.model.enums.PriorityStyle;
import com.y4vra.irboardbackend.domain.model.enums.ProjectState;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "project")
public class Project extends LockableImpl {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    private PriorityStyle priorityStyle;

    @Enumerated(EnumType.STRING)
    private ProjectState state;

    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Functionality> functionalities = new HashSet<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<NonFunctionalRequirement> nonFunctionalRequirements = new HashSet<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Stakeholder> stakeholders = new HashSet<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Document> documents = new HashSet<>();

    public Project() {}

    public Project(String name, String description, String priorityStyle) {
        this.name = name;
        this.description = description;
        this.priorityStyle = (priorityStyle != null) ?
                PriorityStyle.valueOf(priorityStyle.toUpperCase()) :
                PriorityStyle.TERNARY;
        this.state = ProjectState.ACTIVE;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public PriorityStyle getPriorityStyle() { return priorityStyle; }
    public void setPriorityStyle(PriorityStyle priorityStyle) { this.priorityStyle = priorityStyle; }

    public ProjectState getState() { return state; }
    public void setState(ProjectState state) { this.state = state; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Set<Functionality> getFunctionalities() { return Set.copyOf(functionalities); }
    protected Set<Functionality> _getFunctionalities() { return functionalities; }

    public Set<NonFunctionalRequirement> getNonFunctionalRequirements() { return Set.copyOf(nonFunctionalRequirements); }
    protected Set<NonFunctionalRequirement> _getNonFunctionalRequirements() { return nonFunctionalRequirements; }

    public Set<Stakeholder> getStakeholders() { return Set.copyOf(stakeholders); }
    protected Set<Stakeholder> _getStakeholders() { return stakeholders; }

    public Set<Document> getDocuments() { return Set.copyOf(documents); }
    protected Set<Document> _getDocuments() { return documents; }
}