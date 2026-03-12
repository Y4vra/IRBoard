package com.y4vra.irboardbackend.domain.model;

import com.y4vra.irboardbackend.domain.model.enums.RequirementState;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Data;
import lombok.Getter;

import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name="requirement_type")
public abstract class Requirement {

    @Id
    @GeneratedValue
    private long id;

    private Float orderValue;
    private String name;
    private String description;

    @Enumerated(EnumType.STRING)
    private RequirementState state;
    private Boolean isPendingReview;

    @OneToMany(mappedBy = "parent")
    @Getter(AccessLevel.NONE)
    private Set<Requirement> children= new HashSet<Requirement>();
    @ManyToOne
    private Requirement parent;

    public Set<Requirement> getChildren() {
        return new HashSet<>(children);
    }
    protected Set<Requirement> _getChildren() {
        return children;
    }
}
