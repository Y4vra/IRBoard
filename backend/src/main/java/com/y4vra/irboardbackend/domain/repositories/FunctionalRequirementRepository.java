package com.y4vra.irboardbackend.domain.repositories;

import com.y4vra.irboardbackend.domain.model.FunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.NonFunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.enums.RequirementState;

import java.util.List;
import java.util.Optional;

public interface FunctionalRequirementRepository {
    List<FunctionalRequirement> findAllDescendantsOf(Long parentId);
    Optional<FunctionalRequirement> findByIdAndFunctionalityIdAndProjectId(Long id,Long functionalityId,Long projectId);
    FunctionalRequirement save(FunctionalRequirement fr);

    List<FunctionalRequirement> findAllByFunctionalityIdAndProjectIdNotRemoved(Long functionalityId, Long projectId);
    List<FunctionalRequirement> findAllByFunctionalityIdAndProjectIdRemoved(Long functionalityId, Long projectId);

    List<FunctionalRequirement> findAllObservedByRequirement(Long requirementId);
    List<FunctionalRequirement> findObservableFRequirementsForRequirementAndFunctionality(Long projectId,Long functionalityId,Long requirementId);

    Optional<FunctionalRequirement> findByIdWithParentAndFunctionalityIdAndProjectId(Long functionalRequirementId,Long functionalityId,Long projectId);
    Optional<FunctionalRequirement> findByIdWithChildrenAndFunctionalityIdAndProjectId(Long functionalRequirementId,Long functionalityId,Long projectId);

    boolean allFunctionalRequirementsBelongToFunctionalityAndProject(Long projectId,Long functionalityId,List<Long> functionalRequirementIds);
    int updateStateByIdsAndFunctionalityAndProject(List<Long> functionalRequirementIds, Long functionalityId, Long projectId, RequirementState newState, RequirementState oldState);

    int deleteRemovedByIdsAndFunctionalityIdAndProjectId(List<Long> functionalRequirementIds, Long functionalityId,Long projectId);

    List<FunctionalRequirement> findAllByIdsAndFunctionalityIdAndProjectIdAndState(List<Long> functionalRequirementIds, Long functionalityId,Long projectId, RequirementState state);
    List<FunctionalRequirement> findAllByIdsAndFunctionalityIdAndProjectIdAndState(List<Long> functionalRequirementIds, Long functionalityId,Long projectId, List<RequirementState> states);
}
