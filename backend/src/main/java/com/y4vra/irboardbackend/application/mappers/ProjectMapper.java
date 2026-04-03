package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.ProjectDTO;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.enums.ProjectState;
import org.springframework.stereotype.Component;

@Component
public class ProjectMapper {

    public ProjectDTO toDto(Project project) {
        if (project == null) return null;

        ProjectDTO dto = new ProjectDTO(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getState() != null ? project.getState().toString() : null,
                0);

        return dto;
    }

    public Project toEntity(ProjectDTO dto) {
        if (dto == null) return null;

        Project project = new Project();
        project.setId(dto.id());
        project.setName(dto.name());
        project.setDescription(dto.description());
        project.setState(ProjectState.valueOf(dto.state()));

        return project;
    }
}