package com.y4vra.irboardbackend.domain.model;

import com.y4vra.irboardbackend.domain.model.enums.FunctionalityState;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Data;
import lombok.Getter;

import java.util.HashSet;
import java.util.Set;

@Data
@Entity
public class Functionality {

    @Id
    @GeneratedValue
    private long id;
    @Column(unique=true)
    private String name;
    private String label;

    @Enumerated(EnumType.STRING)
    private FunctionalityState state;

    @OneToMany(mappedBy = "functionality")
    @Getter(AccessLevel.NONE)
    private Set<FunctionalRequirement> Requirements = new HashSet<FunctionalRequirement>();

    @ManyToOne
    private Project project;
    @ManyToMany(mappedBy = "engineerFunctionalities")
    @Getter(AccessLevel.NONE)
    private Set<User> requirementEngineers = new HashSet<User>();
    @ManyToMany(mappedBy = "stakeholderFunctionalities")
    @Getter(AccessLevel.NONE)
    private Set<User> stakeholders = new HashSet<User>();


    public Set<User> getStakeholders() {
        return new HashSet<>(stakeholders);
    }
    public Set<User> getRequirementEngineers() {
        return new HashSet<>(requirementEngineers);
    }
    public Set<FunctionalRequirement> getRequirements() {
        return new HashSet<>(Requirements);
    }
    protected Set<User> _getStakeholders() {
        return stakeholders;
    }
    protected Set<User> _getRequirementEngineers() {
        return requirementEngineers;
    }
    protected Set<FunctionalRequirement> _getRequirements() {
        return Requirements;
    }
}
