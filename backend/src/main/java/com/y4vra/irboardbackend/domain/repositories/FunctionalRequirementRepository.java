package com.y4vra.irboardbackend.domain.repositories;

import com.y4vra.irboardbackend.domain.model.FunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.NonFunctionalRequirement;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

public interface FunctionalRequirementRepository {
    List<FunctionalRequirement> findAll();
    List<FunctionalRequirement> findAllById(Iterable<Long> ids);
    Optional<FunctionalRequirement> findById(Long id);
    FunctionalRequirement save(FunctionalRequirement fr);
    void deleteById(Long id);
    List<FunctionalRequirement> findAllByFunctionalityId(Long functionalityId);
    Optional<Long> findRootFunctionalityIdById(Long id);

    List<FunctionalRequirement> findAllObservedByRequirement(Long requirementId);
    List<FunctionalRequirement> findObservableFRequirementsForRequirementAndFunctionality(
            Long projectId,
            Long functionalityId,
            Long requirementId
    );
}
