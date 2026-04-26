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
        if(checkPriority(priority,this.resolveRootFunctionality())){
            this.priority = priority;
        }else{
            throw new IllegalArgumentException();
        }
    }

    public String getStability() { return stability; }
    public void setStability(String stability) { this.stability = stability; }

    public Functionality getFunctionality() { return functionality; }
    public void setFunctionality(Functionality functionality) { this.functionality = functionality; }

    public boolean checkPriority(String setPriority, Functionality functionality) {
        if (setPriority == null || setPriority.equals("")) {
            return false;
        }
        switch (functionality.getProject().getPriorityStyle()){
            case TERNARY -> {
                return setPriority.equals("HIGH")||
                        setPriority.equals("NORMAL")||
                        setPriority.equals("LOW");
            }
            case MOSCOW -> {
                return setPriority.equals("MUST")||
                        setPriority.equals("SHOULD")||
                        setPriority.equals("COULD")||
                        setPriority.equals("WONT");
            }
            default -> {
                return false;
            }
        }
    }

    public Functionality resolveRootFunctionality() {
        if (this.functionality != null) return this.functionality;
        if (this.getParent() instanceof FunctionalRequirement fr) {
            return fr.resolveRootFunctionality();
        }
        return null;
    }
}