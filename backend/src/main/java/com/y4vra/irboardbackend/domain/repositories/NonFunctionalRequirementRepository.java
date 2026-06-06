package com.y4vra.irboardbackend.domain.repositories;

import com.y4vra.irboardbackend.domain.model.Document;
import com.y4vra.irboardbackend.domain.model.NonFunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.enums.RequirementState;

import java.util.List;
import java.util.Optional;

public interface NonFunctionalRequirementRepository {
    List<NonFunctionalRequirement> findAllDescendantsOf(Long rootId);
    Optional<NonFunctionalRequirement> findByIdAndProjectId(Long id,Long projectId);
    NonFunctionalRequirement save(NonFunctionalRequirement nfr);

    List<NonFunctionalRequirement> findAllByProjectIdNotRemoved(Long projectId);
    List<NonFunctionalRequirement> findAllByProjectIdRemoved(Long projectId);

    List<NonFunctionalRequirement> findAllObservedByRequirement(Long requirementId);
    List<NonFunctionalRequirement> findObservableNfRequirementsForRequirement(Long projectId,Long requirementId);

    Optional<NonFunctionalRequirement> findByIdWithParentAndProjectId(Long nonFunctionalRequirementId, Long projectId);
    Optional<NonFunctionalRequirement> findByIdWithChildrenAndProjectId(Long nonFunctionalRequirementId, Long projectId);

    boolean allNonFunctionalRequirementsBelongToProject(Long projectId, List<Long> functionalRequirementIds);
    int updateStateByIdsAndProject(List<Long> functionalRequirementIds, Long projectId, RequirementState requirementState, RequirementState requirementState1);

    int deleteRemovedByIdsAndProjectId(List<Long> nonFunctionalRequirementIds, Long projectId);

    List<NonFunctionalRequirement> findAllByIdsAndProjectIdAndState(List<Long> nonFunctionalRequirementIds, Long projectId, RequirementState state);
    List<NonFunctionalRequirement> findAllByIdsAndProjectIdAndState(List<Long> nonFunctionalRequirementIds, Long projectId, List<RequirementState> states);

    /*-------------------testing purposes----------------*/
    List<NonFunctionalRequirement> findAll();
    void deleteAll();
    void saveAll(List<NonFunctionalRequirement> nonFunctionalRequirements);
}
