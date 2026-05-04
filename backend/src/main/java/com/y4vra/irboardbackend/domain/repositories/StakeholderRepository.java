package com.y4vra.irboardbackend.domain.repositories;

import com.y4vra.irboardbackend.domain.model.Requirement;
import com.y4vra.irboardbackend.domain.model.Stakeholder;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface StakeholderRepository {
    List<Stakeholder> findAll();
    List<Stakeholder> findAllById(Iterable<Long> ids);
    Optional<Stakeholder> findById(Long id);
    List<Stakeholder> findByProjectId(Long projectId);
    Stakeholder save(Stakeholder stakeholder);
    void deleteById(Long id);
    List<Requirement> findFilteredRequirementsForStakeholder(Long stakeholderId, Set<Long> functionalityIds);
    List<Stakeholder> findAllObservedByRequirement(Long requirementId);

    List<Stakeholder> findObservableStakeholdersForRequirement(Long requirementId);
}