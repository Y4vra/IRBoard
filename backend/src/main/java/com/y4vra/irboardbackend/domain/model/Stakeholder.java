package com.y4vra.irboardbackend.domain.model;

import com.y4vra.irboardbackend.domain.model.enums.EntityState;
import com.y4vra.irboardbackend.domain.model.interfaces.ProjectElement;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
public class Stakeholder extends ProjectElement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Enumerated(EnumType.STRING)
    private EntityState state;

    @ManyToMany
    @JoinTable(
            name = "stakeholder_observer_requirement",
            joinColumns = @JoinColumn(name = "stakeholder_id"),
            inverseJoinColumns = @JoinColumn(name = "requirement_id")
    )
    private Set<Requirement> observerRequirements = new HashSet<>();

    public Stakeholder() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public EntityState getState() { return state; }
    public void setState(EntityState state) { this.state = state; }

    public Set<Requirement> getObserverRequirements() { return Set.copyOf(observerRequirements); }
    protected Set<Requirement> _getObserverRequirements() { return observerRequirements; }


    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Stakeholder that = (Stakeholder) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}