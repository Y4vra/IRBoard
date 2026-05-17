package com.y4vra.irboardbackend.domain.repositories;

import com.y4vra.irboardbackend.domain.model.Functionality;
import com.y4vra.irboardbackend.domain.model.enums.RequirementState;
import com.y4vra.irboardbackend.domain.model.projections.ProjectFunctionalityProjection;

import java.util.*;

public interface FunctionalityRepository {
    List<Functionality> findAll();
    List<Functionality> findAllById(Iterable<Long> ids);
    List<Functionality> findByProjectId(Long projectId);
    Optional<Functionality> findById(Long id);
    Functionality save(Functionality functionality);
    void deleteById(Long id);
    Set<Long> findIdsByProjectId(long projectId);

    List<ProjectFunctionalityProjection> groupByIdsGroupedByProject(List<Long> functionalityIds);

}