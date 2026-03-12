package com.y4vra.irboardbackend.infrastructure.persistence;

import com.y4vra.irboardbackend.domain.model.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.UUID;

public interface ProjectRepository extends CrudRepository<Project, Long> {
    Page<Project> findAll(Pageable pageable);
    Project findByIdentifier(String identifier);

    List<Project> getProjectByProjectId(long projectId);
}
