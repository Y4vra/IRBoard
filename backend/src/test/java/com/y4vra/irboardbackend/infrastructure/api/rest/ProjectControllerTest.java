package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.FunctionalityDTO;
import com.y4vra.irboardbackend.application.dtos.ProjectDTO;
import com.y4vra.irboardbackend.application.dtos.StakeholderDTO;
import com.y4vra.irboardbackend.application.mappers.FunctionalityMapper;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.model.*;
import com.y4vra.irboardbackend.domain.model.enums.*;
import com.y4vra.irboardbackend.domain.repositories.NonFunctionalRequirementRepository;
import com.y4vra.irboardbackend.domain.repositories.StakeholderRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.servlet.View;

import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class ProjectControllerTest extends IrBoardBaseTest{

        protected Project disabledProject;
    @Autowired
    private View view;
    @Autowired
    private PermissionService permissionService;
    @Autowired
    private StakeholderRepository stakeholderRepository;

        @Override
        void setUp() {
                disabledProject = projectRepository.save(buildProject("Beta", ProjectState.DEACTIVATED));
        }

        // ════════════════════════════════════════════════════════════════════════
        // tests
        // ════════════════════════════════════════════════════════════════════════

        @Test
        void addNewProject() {
                var body = new ProjectDTO(null, "Gamma", "New project", "TERNARY", null, null, null, null, null, null);

                var response = post(SYSTEM_ADMIN_1_ORY_ID, "/v1/projects/new", body, ProjectDTO.class);

                System.out.println("STATUS: " + response.getStatusCode().value());
                System.out.println("BODY: " + response.getBody());

                assertThat(response.getStatusCode().value()).isEqualTo(201);
                assertThat(response.getBody()).isNotNull();
                assertThat(response.getBody().name()).isEqualTo("Gamma");
                assertThat(response.getBody().id()).isNotNull();

                assertThat(projectRepository.findById(response.getBody().id())).isPresent();
                verify(permissionService, times(1)).grantPermission(any(), any(), any(), any());
                verify(permissionService, times(1)).grantPermissionToSubjectSet(any(), any(), any(), any(), any(), any());
        }
        @Test
        void getProjectById() {
                allowView(SYSTEM_ADMIN_1_ORY_ID,activeProject.getId());

                var response = get(
                        SYSTEM_ADMIN_1_ORY_ID,
                        "/v1/projects/"+activeProject.getId(),
                        ProjectDTO.class,
                        activeProject.getId()
                );

                assertThat(response.getStatusCode().value()).isEqualTo(200);
                assertThat(response.getBody()).isNotNull();
                assertThat(response.getBody().id()).isEqualTo(activeProject.getId());
        }

        @Test
        void isManager() {
                allowEditProject(SYSTEM_ADMIN_1_ORY_ID,activeProject.getId());

                var response = get(
                        SYSTEM_ADMIN_1_ORY_ID,
                        "/v1/projects/"+activeProject.getId()+"/isManager",
                        Boolean.class,
                        activeProject.getId()
                );

                assertThat(response.getStatusCode().value()).isEqualTo(200);
                assertThat(response.getBody()).isTrue();
        }
        @Test
        void getFunctionalities() {
                Functionality editableFunc = functionalityRepository.save(buildFunctionality("editable",FunctionalityState.ACTIVE,activeProject));
                Functionality viewableFunc = functionalityRepository.save(buildFunctionality("viewable",FunctionalityState.ACTIVE,activeProject));
                Functionality viewableFunc2 = functionalityRepository.save(buildFunctionality("viewable2",FunctionalityState.ACTIVE,activeProject));
                Functionality noneFunc = functionalityRepository.save(buildFunctionality("none",FunctionalityState.ACTIVE,activeProject));
                functionalityRepository.save(buildFunctionality("removed",FunctionalityState.REMOVED,activeProject));

                allowEditRequirementsOfFunctionality(REQUIREMENT_ENGINEER_1_ORY_ID,editableFunc.getId());
                allowViewRequirementsOfFunctionality(REQUIREMENT_ENGINEER_1_ORY_ID,viewableFunc.getId());
                allowViewRequirementsOfFunctionality(REQUIREMENT_ENGINEER_1_ORY_ID,viewableFunc2.getId());

                var response = get(
                        REQUIREMENT_ENGINEER_1_ORY_ID,
                        "/v1/projects/"+activeProject.getId()+"/functionalities",
                        new ParameterizedTypeReference<Map<String,List<FunctionalityDTO>>>() {},
                        activeProject.getId()
                );

                assertThat(response.getStatusCode().value()).isEqualTo(200);
                assertThat(response.getBody()).isNotNull();
                assertThat(response.getBody()).containsEntry("edit", List.of(functionalityMapper.toDto(editableFunc)));
                assertThat(response.getBody()).containsEntry("view", List.of(functionalityMapper.toDto(viewableFunc),functionalityMapper.toDto(viewableFunc2)));
                assertThat(response.getBody()).containsEntry("none", List.of(functionalityMapper.toDto(noneFunc)));
        }
        @Test
        void getRemovedFunctionalities() {
                allowEditProject(SYSTEM_ADMIN_1_ORY_ID,activeProject.getId());

                Functionality removedFunctionality = functionalityRepository.save(buildFunctionality("removed",FunctionalityState.REMOVED,activeProject));

                functionalityRepository.saveAll(List.of(
                        buildFunctionality("editable",FunctionalityState.ACTIVE,activeProject),
                        buildFunctionality("viewable",FunctionalityState.ACTIVE,activeProject),
                        buildFunctionality("none",FunctionalityState.ACTIVE,activeProject)
                        ));

                var response = get(
                        SYSTEM_ADMIN_1_ORY_ID,
                        "/v1/projects/"+activeProject.getId()+"/functionalities/removed",
                        new ParameterizedTypeReference<List<FunctionalityDTO>>() {},
                        activeProject.getId()
                );

                assertThat(response.getStatusCode().value()).isEqualTo(200);
                assertThat(response.getBody()).isNotNull();
                assertThat(response.getBody()).contains(functionalityMapper.toDto(removedFunctionality));
        }
        @Test
        void findObservableFRequirementsGroupedByFunctionality() {
                Functionality f = functionalityRepository.save(buildFunctionality("observable",FunctionalityState.ACTIVE,activeProject));
                FunctionalRequirement fr = frRepository.save(buildFr("fr",RequirementState.PENDING_APPROVAL,activeProject,f));
                FunctionalRequirement observable = frRepository.save(buildFr("observable",RequirementState.PENDING_APPROVAL,activeProject,f));

                when(permissionService.getAuthorizedObjects(
                        REQUIREMENT_ENGINEER_1_ORY_ID,
                        "Functionality",
                        "engineers"))
                        .thenReturn(List.of(f.getId().toString()));


                var response = get(
                        REQUIREMENT_ENGINEER_1_ORY_ID,
                        "/v1/projects/"+activeProject.getId()+"/functionalRequirements/observable/"+fr.getId(),
                        new ParameterizedTypeReference<List<FunctionalityDTO>>() {},
                        activeProject.getId(),
                        fr.getId()
                );

                assertThat(response.getStatusCode().value()).isEqualTo(200);
                assertThat(response.getBody()).isNotNull();
                assertThat(response.getBody()).contains(functionalityMapper.toDtoWithRequirements(f,List.of(frMapper.toDto(observable))));
        }
        @Test
        void getStakeholders() {
                Project project2 = projectRepository.save(buildProject("otherProject",ProjectState.ACTIVE));

                stakeholderRepository.saveAll(List.of(
                        buildStakeholder("stk1",EntityState.PENDING_APPROVAL,activeProject),
                        buildStakeholder("stk2",EntityState.PENDING_APPROVAL,activeProject)
                ));
                Stakeholder stkOtherProject = stakeholderRepository.save(
                        buildStakeholder("stkOtherProject",EntityState.PENDING_APPROVAL,project2));

                allowView(PROJECT_MANAGER_1_ORY_ID,activeProject.getId());

                var response = get(
                        PROJECT_MANAGER_1_ORY_ID,
                        "/v1/projects/"+activeProject.getId()+"/stakeholders",
                        new ParameterizedTypeReference<List<StakeholderDTO>>() {},
                        activeProject.getId()
                );

                assertThat(response.getStatusCode().value()).isEqualTo(200);
                assertThat(response.getBody()).isNotNull();
                assertThat(response.getBody()).hasSize(2);
                assertThat(response.getBody()).doesNotContain(stakeholderMapper.toDto(stkOtherProject));
        }
        @Test
        void getRemovedStakeholders() {
                Project project2 = projectRepository.save(buildProject("otherProject",ProjectState.ACTIVE));

                Stakeholder stkRemoved = stakeholderRepository.save(
                        buildStakeholder("stk1",EntityState.REMOVED,activeProject));
                Stakeholder stkPendingApproval = stakeholderRepository.save(
                        buildStakeholder("stk2",EntityState.PENDING_APPROVAL,activeProject));
                Stakeholder stkOtherProject = stakeholderRepository.save(
                        buildStakeholder("stkOtherProject",EntityState.PENDING_APPROVAL,project2));

                allowEditProject(PROJECT_MANAGER_1_ORY_ID,activeProject.getId());

                var response = get(
                        PROJECT_MANAGER_1_ORY_ID,
                        "/v1/projects/"+activeProject.getId()+"/stakeholders/removed",
                        new ParameterizedTypeReference<List<StakeholderDTO>>() {},
                        activeProject.getId()
                );

                assertThat(response.getStatusCode().value()).isEqualTo(200);
                assertThat(response.getBody()).doesNotContain(stakeholderMapper.toDto(stkOtherProject));
                assertThat(response.getBody()).doesNotContain(stakeholderMapper.toDto(stkPendingApproval));
                assertThat(response.getBody()).contains(stakeholderMapper.toDto(stkRemoved));
        }
//        @Test //TODO do these ones.
//        void getNonFunctionalRequirements() {
//                // Assumptions:
//                // - Project contains NFRs
//
//                var response = get(
//                        SYSTEM_ADMIN_1_ORY_ID,
//                        "/v1/projects/{projectId}/nonFunctionalRequirements",
//                        List.class,
//                        TEST_PROJECT_ID
//                );
//
//                assertThat(response.getStatusCode().value()).isEqualTo(200);
//        }
//        @Test
//        void getRemovedNonFunctionalRequirements() {
//                // Assumptions:
//                // - Project contains removed NFRs
//
//                var response = get(
//                        SYSTEM_ADMIN_1_ORY_ID,
//                        "/v1/projects/{projectId}/nonFunctionalRequirements/removed",
//                        List.class,
//                        TEST_PROJECT_ID
//                );
//
//                assertThat(response.getStatusCode().value()).isEqualTo(200);
//        }
//        @Test
//        void getDocuments() {
//                // Assumptions:
//                // - Project contains documents
//
//                var response = get(
//                        SYSTEM_ADMIN_1_ORY_ID,
//                        "/v1/projects/{projectId}/documents",
//                        List.class,
//                        TEST_PROJECT_ID
//                );
//
//                assertThat(response.getStatusCode().value()).isEqualTo(200);
//        }
//        @Test
//        void getRemovedDocuments() {
//                // Assumptions:
//                // - Project contains removed documents
//
//                var response = get(
//                        SYSTEM_ADMIN_1_ORY_ID,
//                        "/v1/projects/{projectId}/documents/removed",
//                        List.class,
//                        TEST_PROJECT_ID
//                );
//
//                assertThat(response.getStatusCode().value()).isEqualTo(200);
//        }
//        @Test
//        void requestEdit() {
//                // Assumptions:
//                // - User is allowed to request edit access
//
//                var response = get(
//                        SYSTEM_ADMIN_1_ORY_ID,
//                        "/v1/projects/{projectId}/requestEdit",
//                        Void.class,
//                        TEST_PROJECT_ID
//                );
//
//                assertThat(response.getStatusCode().value()).isEqualTo(200);
//        }
//        @Test
//        void modifyProject() {
//                // Assumptions:
//                // - User has edit permission
//                // - Project exists
//
//                var patch = new ProjectDTO(
//                        null,
//                        "Updated Name",
//                        null,
//                        null,
//                        null,
//                        null,
//                        null,
//                        null,
//                        null,
//                        null
//                );
//
//                var response = patch(
//                        SYSTEM_ADMIN_1_ORY_ID,
//                        "/v1/projects/{projectId}/modify",
//                        patch,
//                        ProjectDTO.class,
//                        TEST_PROJECT_ID
//                );
//
//                assertThat(response.getStatusCode().value()).isEqualTo(200);
//                assertThat(response.getBody().name()).isEqualTo("Updated Name");
//        }
//        @Test
//        void approveAllElements() {
//                // Assumptions:
//                // - Project contains approvable elements
//
//                var response = post(
//                        SYSTEM_ADMIN_1_ORY_ID,
//                        "/v1/projects/{projectId}/approveAll",
//                        null,
//                        Void.class,
//                        TEST_PROJECT_ID
//                );
//
//                assertThat(response.getStatusCode().value()).isEqualTo(200);
//        }
//        @Test
//        void finishProject() {
//                // Assumptions:
//                // - Project is ACTIVE
//
//                var response = post(
//                        SYSTEM_ADMIN_1_ORY_ID,
//                        "/v1/projects/{projectId}/finish",
//                        null,
//                        Void.class,
//                        TEST_PROJECT_ID
//                );
//
//                assertThat(response.getStatusCode().value()).isEqualTo(200);
//        }
//        @Test
//        void disableProject() {
//                // Assumptions:
//                // - Project state allows disabling
//
//                var response = post(
//                        SYSTEM_ADMIN_1_ORY_ID,
//                        "/v1/projects/{projectId}/disable",
//                        null,
//                        Void.class,
//                        TEST_PROJECT_ID
//                );
//
//                assertThat(response.getStatusCode().value()).isEqualTo(200);
//        }
//        @Test
//        void enableProject() {
//                // Assumptions:
//                // - Project is DISABLED, FINISHED or REMOVED
//
//                var response = post(
//                        SYSTEM_ADMIN_1_ORY_ID,
//                        "/v1/projects/{projectId}/enable",
//                        null,
//                        Void.class,
//                        TEST_PROJECT_ID
//                );
//
//                assertThat(response.getStatusCode().value()).isEqualTo(200);
//        }
//        @Test
//        void removeProject() {
//                // Assumptions:
//                // - Project is DISABLED
//
//                var response = post(
//                        SYSTEM_ADMIN_1_ORY_ID,
//                        "/v1/projects/{projectId}/remove",
//                        null,
//                        Void.class,
//                        TEST_PROJECT_ID
//                );
//
//                assertThat(response.getStatusCode().value()).isEqualTo(200);
//        }
//        @Test
//        void deleteProject() {
//                // Assumptions:
//                // - Project is REMOVED
//
//                var response = post(
//                        SYSTEM_ADMIN_1_ORY_ID,
//                        "/v1/projects/{projectId}/delete",
//                        null,
//                        Void.class,
//                        TEST_PROJECT_ID
//                );
//
//                assertThat(response.getStatusCode().value()).isEqualTo(200);
//        }
}