package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.ProjectDTO;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.enums.ProjectState;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.core.ParameterizedTypeReference;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

public class HomeControllerTest extends IrBoardBaseTest {

    private Project activeProject2;
    private Project finishedProject;
    private Project deactivatedProject;
    private Project removedProject;

    @Override
    void setUp() {
        activeProject2 = projectRepository.save(buildProject("project1", ProjectState.ACTIVE));
        finishedProject = projectRepository.save(buildProject("project2", ProjectState.FINISHED));
        deactivatedProject = projectRepository.save(buildProject("project3", ProjectState.DEACTIVATED));
        removedProject = projectRepository.save(buildProject("project4", ProjectState.REMOVED));
    }

    @Test
    void getHomeForAdmin() {
        allowView(SYSTEM_ADMIN_1_ORY_ID,activeProject.getId());

        var response = get(
                SYSTEM_ADMIN_1_ORY_ID,
                "/v1/home",
                new ParameterizedTypeReference<List<ProjectDTO>>() {}
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotEmpty();
        assertThat(response.getBody()).containsAll(Stream.of(activeProject, activeProject2, finishedProject, deactivatedProject).map(projectMapper::toDto).toList());
        assertThat(response.getBody()).doesNotContain(projectMapper.toDto(removedProject));
    }
    @Test
    void getHomeForProjectManagerWithTwoElements() {
        List<String> projectIds = Stream.of(activeProject, activeProject2, finishedProject, deactivatedProject,removedProject).map(Project::getId).map(String::valueOf).toList();
        List<String> allowedIds = Stream.of(activeProject, finishedProject, deactivatedProject).map(Project::getId).map(String::valueOf).toList();

        Mockito.when(ketoClient.filterAuthorizedObjects(PROJECT_MANAGER_1_ORY_ID, "Project", "view", projectIds))
                .thenReturn(allowedIds);

        var response = get(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/home",
                new ParameterizedTypeReference<List<ProjectDTO>>() {}
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotEmpty();
        assertThat(response.getBody()).containsAll(Stream.of(activeProject, finishedProject, deactivatedProject).map(projectMapper::toDto).toList());
        assertThat(response.getBody()).doesNotContain(projectMapper.toDto(activeProject2));
        assertThat(response.getBody()).doesNotContain(projectMapper.toDto(removedProject));
    }
    @Test
    void getRemovedProjects() {
        allowView(SYSTEM_ADMIN_1_ORY_ID,activeProject.getId());

        var response = get(
                SYSTEM_ADMIN_1_ORY_ID,
                "/v1/projects/removed",
                new ParameterizedTypeReference<List<ProjectDTO>>() {}
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotEmpty();
        assertThat(response.getBody()).doesNotContainAnyElementsOf(Stream.of(activeProject, activeProject2, finishedProject, deactivatedProject).map(projectMapper::toDto).toList());
        assertThat(response.getBody()).contains(projectMapper.toDto(removedProject));
    }
    @Test
    void getRemovedProjectsWithoutAdmin() {
        allowView(PROJECT_MANAGER_1_ORY_ID,activeProject.getId());

        var response = get(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/removed",
                Void.class
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
    }
}
