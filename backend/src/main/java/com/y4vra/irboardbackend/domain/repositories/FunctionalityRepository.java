package com.y4vra.irboardbackend.domain.repositories;

import com.y4vra.irboardbackend.domain.model.Functionality;

import java.util.List;
import java.util.Optional;

public interface FunctionalityRepository {
    List<Functionality> findAll();
    List<Functionality> findAllById(Iterable<Long> ids);
    List<Functionality> findByProjectId(Long projectId);
    Optional<Functionality> findById(Long id);
    Functionality save(Functionality functionality);
    void deleteById(Long id);
}