package com.y4vra.irboardbackend.domain.repositories;

import com.y4vra.irboardbackend.application.dtos.FunctionalityDTO;
import com.y4vra.irboardbackend.domain.model.Functionality;
import com.y4vra.irboardbackend.domain.model.enums.FunctionalityState;
import com.y4vra.irboardbackend.domain.model.enums.ProjectState;
import com.y4vra.irboardbackend.domain.model.projections.ProjectFunctionalityProjection;

import java.util.*;

public interface FunctionalityRepository {
    List<Functionality> findByProjectId(Long projectId);
    Optional<Functionality> findByIdAndProjectId(Long id,Long projectId);
    Optional<Functionality> findByIdAndStateAndProjectIdAndProjectState(Long id, FunctionalityState state, Long projectId, ProjectState projectState);
    Functionality save(Functionality functionality);
    Set<Long> findIdsByProjectId(Long projectId);

    List<ProjectFunctionalityProjection> groupByIdsGroupedByProject(List<Long> functionalityIds);

    List<Long> getActiveRootRequirementIds(Long projectId, Long functionalityId);

    Optional<Functionality> findByIdAndProjectIdAndStateNot(Long functionalityId, Long projectId, FunctionalityState functionalityState);

    Optional<Functionality> findByIdAndProjectIdAndState(Long functionalityId, Long projectId, FunctionalityState functionalityState);

    int deleteFunctionalityAndRequirementsInState(Long projectId, Long functionalityId, FunctionalityState functionalityState);

    Optional<Functionality> findByIdAndState(Long functionalityId, FunctionalityState functionalityState);

    List<Functionality> findByStateAndProjectId(FunctionalityState functionalityState, Long projectId);
    List<Functionality> findByStateNotAndProjectId(FunctionalityState functionalityState, Long projectId);

    Optional<Functionality> findByIdAndStatesAndProjectIdAndProjectState(Long functionalityId, List<FunctionalityState> active, Long projectId, ProjectState projectState);
}