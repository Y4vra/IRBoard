package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.FunctionalityDTO;
import com.y4vra.irboardbackend.application.mappers.FunctionalityMapper;
import com.y4vra.irboardbackend.domain.model.Functionality;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.enums.FunctionalityState;
import com.y4vra.irboardbackend.domain.repositories.FunctionalityRepository;
import com.y4vra.irboardbackend.domain.repositories.ProjectRepository;
import com.y4vra.irboardbackend.infrastructure.clients.KetoClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

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
    private KetoClient ketoClient;

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
    void findFunctionalitiesOfProjectForUser_returnsOnlyAuthorizedFunctionalitiesForProject() {
        String oryId = "user-ory-123";
        when(ketoClient.getAuthorizedObjects(oryId, "Functionality", "viewRequirements"))
                .thenReturn(List.of("10", "99"));

        Functionality otherProjectFunctionality = new Functionality();
        otherProjectFunctionality.setId(99L);
        Project otherProject = new Project();
        otherProject.setId(999L);
        otherProjectFunctionality.setProject(otherProject);

        when(functionalityRepository.findAllById(List.of(10L, 99L)))
                .thenReturn(List.of(functionality, otherProjectFunctionality));
        when(functionalityMapper.toDto(functionality)).thenReturn(functionalityDTO);

        List<FunctionalityDTO> result = functionalityService.findFunctionalitiesOfProjectForUser(oryId, 1L);

        assertThat(result).hasSize(1).containsExactly(functionalityDTO);
        verify(functionalityMapper, never()).toDto(otherProjectFunctionality);
    }

    @Test
    void findFunctionalitiesOfProjectForUser_returnsEmptyWhenNoAuthorizedFunctionalities() {
        String oryId = "user-ory-456";
        when(ketoClient.getAuthorizedObjects(oryId, "Functionality", "viewRequirements"))
                .thenReturn(List.of());
        when(functionalityRepository.findAllById(List.of())).thenReturn(List.of());

        List<FunctionalityDTO> result = functionalityService.findFunctionalitiesOfProjectForUser(oryId, 1L);

        assertThat(result).isEmpty();
    }

    @Test
    void findFunctionalitiesOfProjectForUser_returnsEmptyWhenNoneMatchProject() {
        String oryId = "user-ory-789";
        when(ketoClient.getAuthorizedObjects(oryId, "Functionality", "viewRequirements"))
                .thenReturn(List.of("10"));

        Functionality wrongProject = new Functionality();
        wrongProject.setId(10L);
        Project other = new Project();
        other.setId(42L);
        wrongProject.setProject(other);

        when(functionalityRepository.findAllById(List.of(10L))).thenReturn(List.of(wrongProject));

        List<FunctionalityDTO> result = functionalityService.findFunctionalitiesOfProjectForUser(oryId, 1L);

        assertThat(result).isEmpty();
        verify(functionalityMapper, never()).toDto(any());
    }
}
