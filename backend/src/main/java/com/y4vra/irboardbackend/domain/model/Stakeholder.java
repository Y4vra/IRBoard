package com.y4vra.irboardbackend.domain.model;

import com.y4vra.irboardbackend.domain.errors.DeactivatedEntityException;
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

    @Enumerated(EnumType.STRING)
    private EntityState state;

    @ManyToMany
    @JoinTable(
            name = "stakeholder_observer_requirement",
            joinColumns = @JoinColumn(name = "stakeholder_id"),
            inverseJoinColumns = @JoinColumn(name = "requirement_id")
    )
    private Set<Requirement> observerRequirements = new HashSet<>();

    public void notifyObservers() {
        observerRequirements.forEach(Requirement::update);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

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

    public void checkCanBeModified() {
        if (state.equals(EntityState.DEACTIVATED)){
            throw new DeactivatedEntityException("The stakeholder is deactivated and cannot be modified");
        } else if (state.equals(EntityState.REMOVED)){
            throw new DeactivatedEntityException("The stakeholder is removed and cannot be modified");
        }
    }
}