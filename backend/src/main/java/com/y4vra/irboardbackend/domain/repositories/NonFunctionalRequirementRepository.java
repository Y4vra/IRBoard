package com.y4vra.irboardbackend.domain.repositories;

import com.y4vra.irboardbackend.domain.model.NonFunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.enums.RequirementState;

import java.util.List;
import java.util.Optional;

public interface NonFunctionalRequirementRepository {
    Optional<Long> findRootProjectIdById(Long id);
    List<NonFunctionalRequirement> findAll();
    List<NonFunctionalRequirement> findAllById(Iterable<Long> ids);
    List<NonFunctionalRequirement> findAllByProjectId(Long projectId);
    Optional<NonFunctionalRequirement> findById(Long id);
    NonFunctionalRequirement save(NonFunctionalRequirement nfr);
    void deleteById(Long id);

    List<NonFunctionalRequirement> findAllObservedByRequirement(Long requirementId);
    List<NonFunctionalRequirement> findObservableNfRequirementsForRequirement(Long projectId,Long requirementId);

    Optional<NonFunctionalRequirement> findByIdWithParent(Long nonFunctionalRequirementId);
    Optional<NonFunctionalRequirement> findByIdWithChildren(Long nonFunctionalRequirementId);

    boolean allNonFunctionalRequirementsBelongToProject(Long projectId, List<Long> functionalRequirementIds);
    int updateStateByIdsAndProject(List<Long> functionalRequirementIds, Long projectId, RequirementState requirementState, RequirementState requirementState1);
}
