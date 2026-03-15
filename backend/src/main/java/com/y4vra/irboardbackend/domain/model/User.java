package com.y4vra.irboardbackend.domain.model;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "app_user") // "user" is a reserved word in SQL
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;

    private String name;
    private String surname;

    // Owning side of User <-> Project
    @ManyToMany
    @JoinTable(
            name = "user_projects",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "project_id")
    )
    private Set<Project> projects = new HashSet<>();

    // Inverse side — Functionality owns this via functionality_requirement_engineers
    @ManyToMany(mappedBy = "requirementEngineers")
    private Set<Functionality> engineerFunctionalities = new HashSet<>();

    // Inverse side — Functionality owns this via functionality_stakeholders
    @ManyToMany(mappedBy = "stakeholders")
    private Set<Functionality> stakeholderFunctionalities = new HashSet<>();

    public User() {}

    public Long getId() { return id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSurname() { return surname; }
    public void setSurname(String surname) { this.surname = surname; }

    public Set<Project> getProjects() { return new HashSet<>(projects); }
    protected Set<Project> _getProjects() { return projects; }

    public Set<Functionality> getEngineerFunctionalities() { return new HashSet<>(engineerFunctionalities); }
    protected Set<Functionality> _getEngineerFunctionalities() { return engineerFunctionalities; }

    public Set<Functionality> getStakeholderFunctionalities() { return new HashSet<>(stakeholderFunctionalities); }
    protected Set<Functionality> _getStakeholderFunctionalities() { return stakeholderFunctionalities; }
}