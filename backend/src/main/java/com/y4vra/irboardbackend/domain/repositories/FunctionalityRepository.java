package com.y4vra.irboardbackend.domain.repositories;

import com.y4vra.irboardbackend.domain.model.Functionality;
import com.y4vra.irboardbackend.domain.model.enums.FunctionalityState;
import com.y4vra.irboardbackend.domain.model.projections.ProjectFunctionalityProjection;

import java.util.*;

public interface FunctionalityRepository {
    List<Functionality> findByProjectId(Long projectId);
    Optional<Functionality> findByIdAndProjectId(Long id,Long projectId);
    Functionality save(Functionality functionality);
    Set<Long> findIdsByProjectId(Long projectId);

    List<ProjectFunctionalityProjection> groupByIdsGroupedByProject(List<Long> functionalityIds);

    List<Long> getActiveRootRequirementIds(Long projectId, Long functionalityId);

    Optional<Functionality> findByIdAndProjectIdAndStateNot(Long functionalityId, Long projectId, FunctionalityState functionalityState);

    Optional<Functionality> findByIdAndProjectIdAndState(Long functionalityId, Long projectId, FunctionalityState functionalityState);

    int deleteFunctionalityAndRequirementsInState(Long projectId, Long functionalityId, FunctionalityState functionalityState);
}