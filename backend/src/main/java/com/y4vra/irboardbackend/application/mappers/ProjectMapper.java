package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.ProjectDTO;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.enums.PriorityStyle;
import com.y4vra.irboardbackend.domain.model.enums.ProjectState;
import org.springframework.boot.autoconfigure.info.ProjectInfoProperties;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class ProjectMapper {

    public ProjectDTO toDto(Project project) {
        return toDto(project,false,null,null,null,null);
    }
    public ProjectDTO toDto(Project project,Boolean editPermission, Map<String,Long> stakeholderStats, Map<String,Long> documentStats, Map<String,Long> nonFunctionalRequirementStats, Map<String,Map<String,Long>> functionalRequirementStats) {
        if (project == null) return null;

        ProjectDTO dto = new ProjectDTO(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getPriorityStyle() != null ? project.getPriorityStyle().toString() : null,
                project.getState() != null ? project.getState().toString() : null,
                editPermission,
                stakeholderStats,documentStats,nonFunctionalRequirementStats,functionalRequirementStats
        );

        return dto;
    }

    public Project toEntity(ProjectDTO dto) {
        if (dto == null) return null;

        Project project = new Project();
        project.setId(dto.id());
        project.setName(dto.name());
        project.setDescription(dto.description());
        project.setPriorityStyle(PriorityStyle.valueOf(dto.priorityStyle()));
        project.setState(ProjectState.valueOf(dto.state()));

        return project;
    }

    public void patchEntity(ProjectDTO patch, Project project) {
        if (patch.name() != null && !patch.name().isBlank()) project.setName(patch.name());
        if (patch.description() != null && !patch.description().isBlank()) project.setDescription(patch.description());
        if (patch.priorityStyle() != null && !patch.priorityStyle().isBlank()) project.setPriorityStyle(PriorityStyle.valueOf(patch.priorityStyle()));
        if(patch.state() != null && !patch.state().isBlank()) project.setState(ProjectState.valueOf(patch.state()));
    }
}