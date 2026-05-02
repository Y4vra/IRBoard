package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.domain.model.*;
import org.springframework.transaction.annotation.Transactional;

public abstract class RequirementService {
    // linking
    @Transactional
    public void observeStakeholder(FunctionalRequirement requirement, Stakeholder stakeholder) {
        Associations.observe(requirement, stakeholder);
    }
    @Transactional
    public void observeStakeholder(NonFunctionalRequirement requirement, Stakeholder stakeholder) {
        Associations.observe(requirement, stakeholder);
    }
    @Transactional
    public void observeDocument(FunctionalRequirement requirement, Document document) {
        Associations.observe(requirement, document);
    }
    @Transactional
    public void observeDocument(NonFunctionalRequirement requirement, Document document) {
        Associations.observe(requirement, document);
    }
    @Transactional
    public void observeRequirement(FunctionalRequirement requirement, Requirement requirement2) {
        Associations.observe(requirement, requirement2);
    }
    //unlinking
    @Transactional
    public void unobserveStakeholder(FunctionalRequirement requirement, Stakeholder stakeholder) {
        Associations.unobserve(requirement, stakeholder);
    }
    @Transactional
    public void unobserveStakeholder(NonFunctionalRequirement requirement, Stakeholder stakeholder) {
        Associations.unobserve(requirement, stakeholder);
    }
    @Transactional
    public void unobserveDocument(FunctionalRequirement requirement, Document document) {
        Associations.unobserve(requirement, document);
    }
    @Transactional
    public void unobserveDocument(NonFunctionalRequirement requirement, Document document) {
        Associations.unobserve(requirement, document);
    }
    @Transactional
    public void unobserveRequirement(FunctionalRequirement requirement, Requirement requirement2) {
        Associations.unobserve(requirement, requirement2);
    }
}
