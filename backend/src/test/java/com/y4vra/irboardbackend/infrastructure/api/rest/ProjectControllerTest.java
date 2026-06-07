package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.*;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.model.*;
import com.y4vra.irboardbackend.domain.model.enums.*;
import com.y4vra.irboardbackend.domain.repositories.StakeholderRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.servlet.View;

import java.util.List;
import java.util.Map;

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
    @Test
    void getNonFunctionalRequirements() {
        Project project2 = projectRepository.save(buildProject("otherProject",ProjectState.ACTIVE));

        nfrRepository.saveAll(List.of(
                buildNfr("nfr1",RequirementState.PENDING_APPROVAL,activeProject,ComparisonOperator.EQUAL_TO,1.0,1.0,0.0),
                buildNfr("nfr2",RequirementState.PENDING_APPROVAL,activeProject,ComparisonOperator.EQUAL_TO,1.0,1.0,0.0)
        ));
        NonFunctionalRequirement nfrOtherProject = nfrRepository.save(
                buildNfr("nfrOtherProject",RequirementState.PENDING_APPROVAL,project2,ComparisonOperator.EQUAL_TO,1.0,1.0,0.0));

        allowView(PROJECT_MANAGER_1_ORY_ID,activeProject.getId());

        var response = get(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/nonFunctionalRequirements",
                new ParameterizedTypeReference<List<NonFunctionalRequirementDTO>>() {},
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).hasSize(2);
        assertThat(response.getBody()).doesNotContain(nfrMapper.toDto(nfrOtherProject));
    }
    @Test
    void getRemovedNonFunctionalRequirements() {
        Project project2 = projectRepository.save(buildProject("otherProject",ProjectState.ACTIVE));

        NonFunctionalRequirement nfrRemoved = nfrRepository.save(
                buildNfr("nfr1",RequirementState.REMOVED,activeProject,ComparisonOperator.EQUAL_TO,1.0,1.0,0.0));
        NonFunctionalRequirement nfrPendingApproval = nfrRepository.save(
                buildNfr("nfr2",RequirementState.PENDING_APPROVAL,activeProject,ComparisonOperator.EQUAL_TO,1.0,1.0,0.0));
        NonFunctionalRequirement nfrOtherProject = nfrRepository.save(
                buildNfr("nfrOtherProject",RequirementState.PENDING_APPROVAL,project2,ComparisonOperator.EQUAL_TO,1.0,1.0,0.0));

        allowEditProject(PROJECT_MANAGER_1_ORY_ID,activeProject.getId());

        var response = get(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/nonFunctionalRequirements/removed",
                new ParameterizedTypeReference<List<NonFunctionalRequirementDTO>>() {},
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).doesNotContain(nfrMapper.toDto(nfrOtherProject));
        assertThat(response.getBody()).doesNotContain(nfrMapper.toDto(nfrPendingApproval));
        assertThat(response.getBody()).contains(nfrMapper.toDto(nfrRemoved));
    }
    @Test
    void getDocuments() {
        Project project2 = projectRepository.save(buildProject("otherProject",ProjectState.ACTIVE));

        documentRepository.saveAll(List.of(
                buildDocument("doc1","doc1-s3key",EntityState.PENDING_APPROVAL,activeProject),
                buildDocument("doc2","doc2-s3key",EntityState.PENDING_APPROVAL,activeProject)
        ));
        Document documentOtherProject = documentRepository.save(
                buildDocument("docOtherProject","docOtherProject-s3key",EntityState.PENDING_APPROVAL,project2));

        allowView(PROJECT_MANAGER_1_ORY_ID,activeProject.getId());

        var response = get(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/documents",
                new ParameterizedTypeReference<List<DocumentDTO>>() {},
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).hasSize(2);
        assertThat(response.getBody()).doesNotContain(documentMapper.toDto(documentOtherProject));
    }
    @Test
    void getRemovedDocuments() {
        Project project2 = projectRepository.save(buildProject("otherProject",ProjectState.ACTIVE));

        Document documentRemoved = documentRepository.save(
                buildDocument("doc1","doc1-s3key",EntityState.REMOVED,activeProject));
        Document documentPendingApproval = documentRepository.save(
                buildDocument("doc2","doc2-s3key",EntityState.PENDING_APPROVAL,activeProject));
        Document documentOtherProject = documentRepository.save(
                buildDocument("docOtherProject","docOtherProject-s3key",EntityState.PENDING_APPROVAL,project2));

        allowEditProject(PROJECT_MANAGER_1_ORY_ID,activeProject.getId());

        var response = get(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/documents/removed",
                new ParameterizedTypeReference<List<DocumentDTO>>() {},
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).doesNotContain(documentMapper.toDto(documentOtherProject));
        assertThat(response.getBody()).doesNotContain(documentMapper.toDto(documentPendingApproval));
        assertThat(response.getBody()).contains(documentMapper.toDtoDetailed(documentRemoved,"https://minio.test/doc1-s3key"));
    }
    @Test
    void requestEdit() {

        var response = get(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/requestEdit",
                Void.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
    }
    @Test
    void modifyProject() {
        get(
            PROJECT_MANAGER_1_ORY_ID,
            "/v1/projects/"+activeProject.getId()+"/requestEdit",
            Void.class,
            activeProject.getId()
        );

        var patch = new ProjectDTO(
            null,
            "Updated Name",
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        );

        var response = patch(
            PROJECT_MANAGER_1_ORY_ID,
            "/v1/projects/"+activeProject.getId()+"/modify",
            patch,
            ProjectDTO.class,
            activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().name()).isEqualTo("Updated Name");
    }
    @Test
    void approveAllElements() {
        Stakeholder stakeholder = stakeholderRepository.save(buildStakeholder("stk",EntityState.PENDING_APPROVAL,activeProject));
        NonFunctionalRequirement nfr = nfrRepository.save(buildNfr("nfr",RequirementState.PENDING_APPROVAL,activeProject,ComparisonOperator.EQUAL_TO,1.0,1.0,1.0));
        Document document = documentRepository.save(buildDocument("doc","doc-s3key",EntityState.PENDING_APPROVAL,activeProject));
        Functionality functionality = functionalityRepository.save(buildFunctionality("func",FunctionalityState.ACTIVE,activeProject));
        FunctionalRequirement functionalRequirement = frRepository.save(buildFr("fr",RequirementState.PENDING_APPROVAL,activeProject,functionality));

        allowEditProject(PROJECT_MANAGER_1_ORY_ID,activeProject.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/approveAll",
                null,
                Void.class,
                activeProject.getId()
        );

        stakeholder = stakeholderRepository.findByIdAndProjectId(stakeholder.getId(),activeProject.getId()).orElse(null);
        nfr = nfrRepository.findByIdAndProjectId(nfr.getId(),activeProject.getId()).orElse(null);
        document = documentRepository.findByIdAndProjectId(document.getId(),activeProject.getId()).orElse(null);
        functionalRequirement = frRepository.findByIdAndFunctionalityIdAndProjectId(functionalRequirement.getId(),functionality.getId(),activeProject.getId()).orElse(null);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(stakeholder.getState()).isEqualTo(EntityState.APPROVED);
        assertThat(nfr.getState()).isEqualTo(RequirementState.APPROVED);
        assertThat(document.getState()).isEqualTo(EntityState.APPROVED);
        assertThat(functionalRequirement.getState()).isEqualTo(RequirementState.APPROVED);
    }
    @Test
    void finishProject() {
        Project project = projectRepository.save(buildProject("project",ProjectState.ACTIVE));

        allowEditProject(PROJECT_MANAGER_1_ORY_ID,project.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+project.getId()+"/finish",
                null,
                Void.class,
                project.getId()
        );

        project = projectRepository.findById(project.getId()).orElseThrow(()->new EntityNotFoundException("Project not found"));

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(project.getState()).isEqualTo(ProjectState.FINISHED);
    }
    @Test
    void disableProject() {
        allowEditProject(PROJECT_MANAGER_1_ORY_ID,activeProject.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/disable",
                null,
                Void.class,
                activeProject.getId()
        );

        activeProject = projectRepository.findById(activeProject.getId()).orElseThrow(()->new EntityNotFoundException("Project not found"));

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(activeProject.getState()).isEqualTo(ProjectState.DEACTIVATED);
    }
    @Test
    void enableProject() {
        Project disabledProject = projectRepository.save(buildProject("disabledProject",ProjectState.DEACTIVATED));
        Project finishedProject = projectRepository.save(buildProject("finishedProject",ProjectState.FINISHED));

        allowEditProject(PROJECT_MANAGER_1_ORY_ID,disabledProject.getId());
        allowEditProject(PROJECT_MANAGER_1_ORY_ID,finishedProject.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+disabledProject.getId()+"/enable",
                null,
                Void.class,
                disabledProject.getId()
        );

        disabledProject = projectRepository.findById(disabledProject.getId()).orElseThrow(()->new EntityNotFoundException("Project not found"));

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(disabledProject.getState()).isEqualTo(ProjectState.ACTIVE);

        response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+finishedProject.getId()+"/enable",
                null,
                Void.class,
                finishedProject.getId()
        );

        finishedProject = projectRepository.findById(finishedProject.getId()).orElseThrow(()->new EntityNotFoundException("Project not found"));

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(finishedProject.getState()).isEqualTo(ProjectState.ACTIVE);
    }
    @Test
    void removeProject() {
        Project disabledProject = projectRepository.save(buildProject("disabledProject",ProjectState.DEACTIVATED));

        allowEditProject(PROJECT_MANAGER_1_ORY_ID,disabledProject.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+disabledProject.getId()+"/remove",
                null,
                Void.class,
                disabledProject.getId()
        );

        disabledProject = projectRepository.findById(disabledProject.getId()).orElseThrow(()->new EntityNotFoundException("Project not found"));

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(disabledProject.getState()).isEqualTo(ProjectState.REMOVED);
    }
    @Test
    void deleteProject() {
        Project removedProject = projectRepository.save(buildProject("removedProject",ProjectState.REMOVED));

        allowEditProject(SYSTEM_ADMIN_1_ORY_ID,removedProject.getId());

        var response = post(
                SYSTEM_ADMIN_1_ORY_ID,
                "/v1/projects/"+removedProject.getId()+"/delete",
                null,
                Void.class,
                removedProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(projectRepository.findById(removedProject.getId())).isEmpty();
    }
}