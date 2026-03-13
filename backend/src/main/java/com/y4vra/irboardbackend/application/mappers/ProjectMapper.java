package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.ProjectDTO;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.enums.ProjectState;
import org.springframework.stereotype.Component;

@Component
public class ProjectMapper {

    public ProjectDTO toDto(Project project) {
        if (project == null) return null;

        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setState(project.getState().toString());

        return dto;
    }

    public Project toEntity(ProjectDTO dto) {
        if (dto == null) return null;

        Project project = new Project();
        project.setId(dto.getId());
        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        project.setState(ProjectState.valueOf(dto.getState()));

        return project;
    }
}