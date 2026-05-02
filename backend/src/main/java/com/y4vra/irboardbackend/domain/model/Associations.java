package com.y4vra.irboardbackend.domain.model;

public class Associations {
    public static void link(Project p, Functionality f){
        f.setProject(p);
        p._getFunctionalities().add(f);
    }
    public static void unlink(Project p, Functionality f){
        p._getFunctionalities().remove(f);
        f.setProject(null);
    }
    public static void link(Project p, Stakeholder s){
        s.setProject(p);
        p._getStakeholders().add(s);
    }
    public static void unlink(Project p, Stakeholder s){
        p._getStakeholders().remove(s);
        s.setProject(null);
    }
    public static void link(Project p, NonFunctionalRequirement nfr){
        nfr.setProject(p);
        p._getNonFunctionalRequirements().add(nfr);
    }
    public static void unlink(Project p, NonFunctionalRequirement nfr){
        p._getNonFunctionalRequirements().remove(nfr);
        nfr.setProject(null);
    }
    public static void link(Project p, Document d){
        d.setProject(p);
        p._getDocuments().add(d);
    }
    public static void unlink(Project p, Document d){
        p._getDocuments().remove(d);
        d.setProject(null);
    }
    public static void link(Functionality f, FunctionalRequirement fr){
        fr.setFunctionality(f);
        f._getRequirements().add(fr);
    }
    public static void unlink(Functionality f, FunctionalRequirement fr){
        f._getRequirements().remove(fr);
        fr.setFunctionality(null);
    }
    public static void link(Requirement parent, Requirement child){
        child.setParent(parent);
        parent._getChildren().add(child);
    }
    public static void unlink(Requirement parent, Requirement child){
        parent._getChildren().remove(child);
        child.setParent(null);
    }

    public static void observe(Requirement observer, Stakeholder observed){
        observer._getObservedStakeholders().add(observed);
        observed._getObserverRequirements().add(observer);
    }
    public static void unobserve(Requirement observer, Stakeholder observed){
        observed._getObserverRequirements().remove(observer);
        observer._getObservedStakeholders().remove(observed);
    }
    public static void observe(Requirement observer, Document observed){
        observer._getObservedDocuments().add(observed);
        observed._getObserverRequirements().add(observer);
    }
    public static void unobserve(Requirement observer, Document observed){
        observed._getObserverRequirements().remove(observer);
        observer._getObservedDocuments().remove(observed);
    }
    public static void observe(Requirement observer, Requirement observed){
        observer._getObservedRequirements().add(observed);
        observed._getObserverRequirements().add(observer);
    }
    public static void unobserve(Requirement observer, Requirement observed){
        observed._getObserverRequirements().remove(observer);
        observer._getObservedRequirements().remove(observed);
    }
}
