package com.y4vra.irboardbackend.domain.repositories;

import com.y4vra.irboardbackend.domain.model.Document;
import com.y4vra.irboardbackend.domain.model.Requirement;
import com.y4vra.irboardbackend.domain.model.Stakeholder;
import com.y4vra.irboardbackend.domain.model.enums.EntityState;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface StakeholderRepository {
    //base queries to be avoided
    List<Stakeholder> findAll();
    List<Stakeholder> findAllById(Iterable<Long> ids);
    Optional<Stakeholder> findByIdAndProjectId(Long id,Long projectId);
    Stakeholder save(Stakeholder stakeholder);

    List<Stakeholder> findAllByProjectIdNotRemoved(Long projectId);
    List<Stakeholder> findAllByProjectIdRemoved(Long projectId);

    List<Requirement> findFilteredRequirementsForStakeholder(Long stakeholderId, Set<Long> functionalityIds);
    List<Stakeholder> findAllObservedByRequirement(Long requirementId);
    List<Stakeholder> findObservableStakeholdersForRequirement(Long projectId,Long requirementId);

    boolean allStakeholdersBelongToProject(Long projectId, List<Long> stakeholderIds);
    int updateStateByIdsAndProject(List<Long> stakeholderIds, Long projectId, EntityState newState, EntityState oldState);

    int deleteRemovedByIdsAndProject(List<Long> stakeholderIds, Long projectId);

    List<Stakeholder> findAllByIdsAndProjectIdAndState(List<Long> stakeholderIds, Long projectId, EntityState state);
    List<Stakeholder> findAllByIdsAndProjectIdAndState(List<Long> stakeholderIds, Long projectId, List<EntityState> states);
}