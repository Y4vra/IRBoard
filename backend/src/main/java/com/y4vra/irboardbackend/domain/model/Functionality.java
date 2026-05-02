package com.y4vra.irboardbackend.domain.model;

import com.y4vra.irboardbackend.domain.model.enums.EntityState;
import com.y4vra.irboardbackend.domain.model.interfaces.Lockable;
import com.y4vra.irboardbackend.domain.model.interfaces.ProjectElement;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Table(
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"label", "project_id"})
        }
)
@Entity
public class Functionality extends ProjectElement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;

    private String label;

    @Enumerated(EnumType.STRING)
    private EntityState state;

    @OneToMany(mappedBy = "functionality", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<FunctionalRequirement> requirements = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    public Functionality() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public EntityState getState() { return state; }
    public void setState(EntityState state) { this.state = state; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public Set<FunctionalRequirement> getRequirements() { return new HashSet<>(requirements); }
    protected Set<FunctionalRequirement> _getRequirements() { return requirements; }
}