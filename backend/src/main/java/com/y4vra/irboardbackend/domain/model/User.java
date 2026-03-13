package com.y4vra.irboardbackend.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class User {

    @Id
    @GeneratedValue
    private long id;

    @Column(unique=true)
    private String email;

    private String nombre;
    private String apellido;

    @ManyToMany(mappedBy = "projectManagers")
    @Getter(AccessLevel.NONE)
    private Set<Project> projects = new HashSet<>();
    @ManyToMany(mappedBy = "requirementEngineers")
    @Getter(AccessLevel.NONE)
    private Set<Functionality> engineerFunctionalities= new HashSet<>();
    @ManyToMany(mappedBy = "stakeholders")
    @Getter(AccessLevel.NONE)
    private Set<Functionality> stakeholderFunctionalities = new HashSet<>();

    public Set<Functionality> getStakeholderFunctionalities() {
        return new HashSet<>(stakeholderFunctionalities);
    }
    public Set<Functionality> getEngineerFunctionalities() {
        return new HashSet<>(engineerFunctionalities);
    }
    public Set<Project> getProjects() {
        return new HashSet<>(projects);
    }
    protected Set<Functionality> _getStakeholderFunctionalities() {
        return stakeholderFunctionalities;
    }
    protected Set<Functionality> _getEngineerFunctionalities() {
        return engineerFunctionalities;
    }
    protected Set<Project> _getProjects() {
        return projects;
    }
}
