package com.y4vra.irboardbackend.domain.repositories;

import com.y4vra.irboardbackend.domain.model.NonFunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.Project; // Asumiendo que tus entidades están en la raíz o .entities
import com.y4vra.irboardbackend.domain.model.enums.ProjectState;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository {
    List<Project> findAllByStateNot(ProjectState state);
    List<Project> findAllByState(ProjectState state);
    List<Project> findAllById(Iterable<Long> ids);
    Optional<Project> findByIdAndState(Long id, ProjectState state);
    Project save(Project project);
    void deleteByIdAndState(Long id,ProjectState state);

    void approveAllElementsInProject(Long projectId);

    List<Long> findAllIds();

    boolean checkAllElementsAreFinished(Long projectId);

    Optional<Project> findByIdAndStates(Long projectId, List<ProjectState> active);

    Optional<Project> findById(Long projectId);

    /*-------------------testing purposes----------------*/
    List<Project> findAll();
    void deleteAll();
    void saveAll(List<Project> projects);
}