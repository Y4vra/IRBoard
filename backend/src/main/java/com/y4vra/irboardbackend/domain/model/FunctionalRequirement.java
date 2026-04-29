package com.y4vra.irboardbackend.domain.model;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("FR")
public class FunctionalRequirement extends Requirement {

    private String priority;
    private String stability;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "functionality_id")
    private Functionality functionality;//may be null if child of another

    public FunctionalRequirement() {}

    public String getPriority() { return priority; }
    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStability() { return stability; }
    public void setStability(String stability) { this.stability = stability; }

    public Functionality getFunctionality() { return functionality; }
    public void setFunctionality(Functionality functionality) { this.functionality = functionality; }

}