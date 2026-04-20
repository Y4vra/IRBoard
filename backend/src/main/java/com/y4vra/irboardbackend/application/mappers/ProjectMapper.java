package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.ProjectDTO;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.enums.PriorityStyle;
import com.y4vra.irboardbackend.domain.model.enums.ProjectState;
import org.springframework.boot.autoconfigure.info.ProjectInfoProperties;
import org.springframework.stereotype.Component;

@Component
public class ProjectMapper {

    private UserMapper userMapper = new UserMapper();

    public ProjectMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public ProjectDTO toDto(Project project) {
        if (project == null) return null;

        ProjectDTO dto = new ProjectDTO(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getPriorityStyle() != null ? project.getPriorityStyle().toString() : null,
                project.getState() != null ? project.getState().toString() : null,
                0,
                userMapper.toDto(project.getModifyingUser()),
                project.getStartModificationDate(),
                project.isLocked()
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
        project.setModifyingUser(userMapper.toEntity(dto.modificatingUser()));
        project.setStartModificationDate(dto.startModificationDate());

        return project;
    }
}