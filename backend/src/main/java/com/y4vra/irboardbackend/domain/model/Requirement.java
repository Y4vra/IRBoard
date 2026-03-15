package com.y4vra.irboardbackend.domain.model;

import com.y4vra.irboardbackend.domain.model.enums.RequirementState;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "requirement_type")
public abstract class Requirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Float orderValue;
    private String name;
    private String description;

    @Enumerated(EnumType.STRING)
    private RequirementState state;

    private Boolean isPendingReview;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Requirement> children = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Requirement parent;

    public Requirement() {}

    public Long getId() { return id; }

    public Float getOrderValue() { return orderValue; }
    public void setOrderValue(Float orderValue) { this.orderValue = orderValue; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public RequirementState getState() { return state; }
    public void setState(RequirementState state) { this.state = state; }

    public Boolean getIsPendingReview() { return isPendingReview; }
    public void setIsPendingReview(Boolean isPendingReview) { this.isPendingReview = isPendingReview; }

    public Set<Requirement> getChildren() { return new HashSet<>(children); }

    /** Use for JPA/internal mutation only */
    protected Set<Requirement> _getChildren() { return children; }

    public Requirement getParent() { return parent; }
    public void setParent(Requirement parent) { this.parent = parent; }
}