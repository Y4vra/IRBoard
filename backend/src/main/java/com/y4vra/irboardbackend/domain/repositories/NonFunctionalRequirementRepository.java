package com.y4vra.irboardbackend.domain.repositories;

import com.y4vra.irboardbackend.domain.model.NonFunctionalRequirement;

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
}
