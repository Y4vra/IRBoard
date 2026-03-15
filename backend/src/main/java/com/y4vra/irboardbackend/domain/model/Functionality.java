package com.y4vra.irboardbackend.domain.model;

import com.y4vra.irboardbackend.domain.model.enums.FunctionalityState;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
public class Functionality {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String name;

    private String label;

    @Enumerated(EnumType.STRING)
    private FunctionalityState state;

    @OneToMany(mappedBy = "functionality", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<FunctionalRequirement> requirements = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    // Owning side of User <-> Functionality (requirementEngineers)
    @ManyToMany
    @JoinTable(
            name = "functionality_requirement_engineers",
            joinColumns = @JoinColumn(name = "functionality_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> requirementEngineers = new HashSet<>();

    // Owning side of User <-> Functionality (stakeholders)
    @ManyToMany
    @JoinTable(
            name = "functionality_stakeholders",
            joinColumns = @JoinColumn(name = "functionality_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> stakeholders = new HashSet<>();

    public Functionality() {}

    public Long getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public FunctionalityState getState() { return state; }
    public void setState(FunctionalityState state) { this.state = state; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public Set<FunctionalRequirement> getRequirements() { return new HashSet<>(requirements); }
    protected Set<FunctionalRequirement> _getRequirements() { return requirements; }

    public Set<User> getRequirementEngineers() { return new HashSet<>(requirementEngineers); }
    protected Set<User> _getRequirementEngineers() { return requirementEngineers; }

    public Set<User> getStakeholders() { return new HashSet<>(stakeholders); }
    protected Set<User> _getStakeholders() { return stakeholders; }
}