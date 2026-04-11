package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.FunctionalityDTO;
import com.y4vra.irboardbackend.application.mappers.FunctionalityMapper;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.model.Functionality;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.enums.FunctionalityState;
import com.y4vra.irboardbackend.domain.repositories.FunctionalityRepository;
import com.y4vra.irboardbackend.domain.repositories.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FunctionalityServiceTest {

    @Mock
    private FunctionalityRepository functionalityRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private FunctionalityMapper functionalityMapper;

    @Mock
    private PermissionService permService;

    @InjectMocks
    private FunctionalityService functionalityService;

    private Project project;
    private Functionality functionality;
    private FunctionalityDTO functionalityDTO;

    @BeforeEach
    void setUp() {
        project = new Project();
        project.setId(1L);

        functionality = new Functionality();
        functionality.setId(10L);
        functionality.setName("User Management");
        functionality.setLabel("UM");
        functionality.setState(FunctionalityState.ACTIVE);
        functionality.setProject(project);

        functionalityDTO = new FunctionalityDTO(10L, "User Management", "UM", "ACTIVE", 1L);
    }

    @Test
    void findFunctionalitiesOfProjectForUser_categorizesFunctionalitiesCorrectly() {
        String oryId = "user-ory-123";
        long projectId = 1L;

        // Mocking Keto response for Edit and View permissions
        when(permService.getAuthorizedObjects(oryId, "Functionality", "editRequirements"))
                .thenReturn(List.of("10")); // Can edit 10
        when(permService.getAuthorizedObjects(oryId, "Functionality", "viewRequirements"))
                .thenReturn(List.of("10", "11")); // Can view 10 and 11

        // Setup functionalities for this project
        Functionality funcEdit = new Functionality(); funcEdit.setId(10L); funcEdit.setProject(project);
        Functionality funcView = new Functionality(); funcView.setId(11L); funcView.setProject(project);
        Functionality funcNone = new Functionality(); funcNone.setId(12L); funcNone.setProject(project);

        when(functionalityRepository.findAll()).thenReturn(List.of(funcEdit, funcView, funcNone));

        // Setup DTOs
        FunctionalityDTO dtoEdit = new FunctionalityDTO(10L, "Edit", "E", "ACTIVE", 1L);
        FunctionalityDTO dtoView = new FunctionalityDTO(11L, "View", "V", "ACTIVE", 1L);
        FunctionalityDTO dtoNone = new FunctionalityDTO(12L, "None", "N", "ACTIVE", 1L);

        when(functionalityMapper.toDto(funcEdit)).thenReturn(dtoEdit);
        when(functionalityMapper.toDto(funcView)).thenReturn(dtoView);
        when(functionalityMapper.toDto(funcNone)).thenReturn(dtoNone);

        // EXECUTE
        Map<String, List<FunctionalityDTO>> result = functionalityService.findFunctionalitiesOfProjectForUser(oryId, projectId);

        // ASSERT
        assertThat(result).containsKeys("edit", "view", "none");
        assertThat(result.get("edit")).containsExactly(dtoEdit);
        assertThat(result.get("view")).containsExactly(dtoView);
        assertThat(result.get("none")).containsExactly(dtoNone);
    }

    @Test
    void findFunctionalitiesOfProjectForUser_filtersByProjectId() {
        String oryId = "user-ory-123";

        Functionality correctProject = new Functionality();
        correctProject.setId(10L);
        correctProject.setProject(project); // ID 1L

        Functionality wrongProject = new Functionality();
        wrongProject.setId(20L);
        Project otherP = new Project(); otherP.setId(999L);
        wrongProject.setProject(otherP);

        when(functionalityRepository.findAll()).thenReturn(List.of(correctProject, wrongProject));
        when(permService.getAuthorizedObjects(anyString(), anyString(), anyString())).thenReturn(List.of("10", "20"));
        when(functionalityMapper.toDto(correctProject)).thenReturn(functionalityDTO);

        Map<String, List<FunctionalityDTO>> result = functionalityService.findFunctionalitiesOfProjectForUser(oryId, 1L);

        // Should only contain the one from project 1
        assertThat(result.get("edit")).hasSize(1);
        assertThat(result.get("edit").get(0).id()).isEqualTo(10L);
        verify(functionalityMapper, never()).toDto(wrongProject);
    }
}
