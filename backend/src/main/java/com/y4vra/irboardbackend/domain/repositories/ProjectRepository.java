package com.y4vra.irboardbackend.domain.repositories;

import com.y4vra.irboardbackend.domain.model.Project; // Asumiendo que tus entidades están en la raíz o .entities
import java.util.List;
import java.util.Optional;

public interface ProjectRepository {
    List<Project> findAll();
    List<Project> findAllById(Iterable<Long> ids);
    Optional<Project> findById(Long id);
    Project save(Project project);
    void deleteById(Long id);
}