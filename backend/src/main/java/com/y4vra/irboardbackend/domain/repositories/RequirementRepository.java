package com.y4vra.irboardbackend.domain.repositories;

import com.y4vra.irboardbackend.domain.model.Requirement;

import java.util.List;
import java.util.Optional;

public interface RequirementRepository {
    List<Requirement> findAll();
    List<Requirement> findAllById(Iterable<Long> ids);
    Optional<Requirement> findById(Long id);
}
