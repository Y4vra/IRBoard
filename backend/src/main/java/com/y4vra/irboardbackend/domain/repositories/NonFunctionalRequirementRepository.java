package com.y4vra.irboardbackend.domain.repositories;

import com.y4vra.irboardbackend.domain.model.NonFunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.enums.RequirementState;

import java.util.List;
import java.util.Optional;

public interface NonFunctionalRequirementRepository {
    Optional<Long> findRootProjectIdById(Long id);
    List<NonFunctionalRequirement> findAllDescendantsOf(Long rootId);
    List<NonFunctionalRequirement> findAll();
    List<NonFunctionalRequirement> findAllById(Iterable<Long> ids);
    Optional<NonFunctionalRequirement> findByIdAndProjectId(Long id,Long projectId);
    NonFunctionalRequirement save(NonFunctionalRequirement nfr);

    List<NonFunctionalRequirement> findAllByProjectIdNotRemoved(Long projectId);
    List<NonFunctionalRequirement> findAllByProjectIdRemoved(Long projectId);

    List<NonFunctionalRequirement> findAllObservedByRequirement(Long requirementId);
    List<NonFunctionalRequirement> findObservableNfRequirementsForRequirement(Long projectId,Long requirementId);

    Optional<NonFunctionalRequirement> findByIdWithParent(Long nonFunctionalRequirementId);
    Optional<NonFunctionalRequirement> findByIdWithChildren(Long nonFunctionalRequirementId);

    boolean allNonFunctionalRequirementsBelongToProject(Long projectId, List<Long> functionalRequirementIds);
    int updateStateByIdsAndProject(List<Long> functionalRequirementIds, Long projectId, RequirementState requirementState, RequirementState requirementState1);

    int deleteRemovedByIdsAndProject(List<Long> nonFunctionalRequirementIds, Long projectId);

    List<NonFunctionalRequirement> findAllByIdsAndProjectIdAndState(List<Long> nonFunctionalRequirementIds, Long projectId, RequirementState state);
    List<NonFunctionalRequirement> findAllByIdsAndProjectIdAndState(List<Long> nonFunctionalRequirementIds, Long projectId, List<RequirementState> states);
}
