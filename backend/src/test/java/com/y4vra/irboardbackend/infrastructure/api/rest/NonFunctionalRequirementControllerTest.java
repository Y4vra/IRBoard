package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.NonFunctionalRequirementDTO;
import com.y4vra.irboardbackend.domain.model.*;
import com.y4vra.irboardbackend.domain.model.enums.*;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class NonFunctionalRequirementControllerTest extends IrBoardBaseTest {

    @Override
    void setUp() {}

    // ════════════════════════════════════════════════════════════════════════
    // GET /{nonFunctionalRequirementId}
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void getNonFunctionalRequirement_returnsCorrectNfr() {
        NonFunctionalRequirement active = nfrRepository.save(
                buildNfr("active-nfr", RequirementState.APPROVED, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));
        NonFunctionalRequirement removed = nfrRepository.save(
                buildNfr("removed-nfr", RequirementState.REMOVED, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));

        allowView(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var response = get(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/" + active.getId(),
                NonFunctionalRequirementDTO.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).isEqualTo(nfrMapper.toDto(active));

        allowEditProject(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        response = get(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/" + removed.getId(),
                NonFunctionalRequirementDTO.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).isEqualTo(nfrMapper.toDto(removed));
    }

    @Test
    void getNonFunctionalRequirement_returns403_whenUserLacksPermission() {
        NonFunctionalRequirement nfr = nfrRepository.save(
                buildNfr("nfr", RequirementState.APPROVED, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));

        var response = get(
                STAKEHOLDER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/" + nfr.getId(),
                Void.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
    }

    @Test
    void getNonFunctionalRequirement_returns404_whenNotFound() {
        allowView(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var response = get(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/999999",
                NonFunctionalRequirementDTO.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(404);
    }

    // ════════════════════════════════════════════════════════════════════════
    // GET /observable/{requirementId}
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void getObservableNfrForRequirement_returns403_whenUserLacksPermission() {
        Functionality f = functionalityRepository.save(
                buildFunctionality("func", FunctionalityState.ACTIVE, activeProject));
        FunctionalRequirement fr = frRepository.save(
                buildFr("fr", RequirementState.APPROVED, activeProject, f));

        var response = get(
                STAKEHOLDER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/observable/" + fr.getId(),
                Void.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /new
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void createNonFunctionalRequirement_returns201_andPersists() {
        allowEdit(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var body = new NonFunctionalRequirementDTO(
                null, null, "Response Time", "Max latency", 0L, RequirementState.PENDING_APPROVAL.name(),
                "ms", ComparisonOperator.LESS_THAN.name(), 200.0, 100.0, 0.0,
                activeProject.getId(),null,null, null, null, null, null);

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/new",
                body,
                NonFunctionalRequirementDTO.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(201);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().id()).isNotNull();
        assertThat(response.getBody().name()).isEqualTo("Response Time");
        assertThat(nfrRepository.findByIdAndProjectId(response.getBody().id(), activeProject.getId())).isPresent();
    }

    @Test
    void createNonFunctionalRequirement_returns403_whenUserLacksEditPermission() {
        var body = new NonFunctionalRequirementDTO(
                null, null, "Response Time", "desc", 0L, RequirementState.PENDING_APPROVAL.name(),
                "ms", ComparisonOperator.LESS_THAN.name(), 200.0, 100.0, 0.0,
                null, activeProject.getId(), null, null, null, null, null);

        var response = post(
                STAKEHOLDER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/new",
                body,
                NonFunctionalRequirementDTO.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
    }

    // ════════════════════════════════════════════════════════════════════════
    // GET /{id}/requestEdit
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void requestEdit_returns200() {
        NonFunctionalRequirement nfr = nfrRepository.save(
                buildNfr("nfr", RequirementState.APPROVED, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));

        allowEditProject(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var response = get(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/" + nfr.getId() + "/requestEdit",
                Void.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
    }

    @Test
    void requestEdit_returns403_whenUserLacksPermission() {
        NonFunctionalRequirement nfr = nfrRepository.save(
                buildNfr("nfr", RequirementState.APPROVED, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));

        var response = get(
                STAKEHOLDER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/" + nfr.getId() + "/requestEdit",
                Void.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
    }

    // ════════════════════════════════════════════════════════════════════════
    // PATCH /{id}/modify
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void modifyNonFunctionalRequirement_updatesName() {
        NonFunctionalRequirement nfr = nfrRepository.save(
                buildNfr("OldName", RequirementState.APPROVED, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));

        allowEdit(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());
        allowEditProject(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        get(PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/" + nfr.getId() + "/requestEdit",
                Void.class, activeProject.getId());

        var patch = new NonFunctionalRequirementDTO(
                null, null, "NewName", null, 0L,
                null, null, null, null, null,
                null, activeProject.getId(), null, null, null,null,null,null);

        var response = patch(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/" + nfr.getId() + "/modify",
                patch,
                NonFunctionalRequirementDTO.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().name()).isEqualTo("NewName");
        assertThat(reload(nfr, activeProject).getName()).isEqualTo("NewName");
    }

    @Test
    void modifyNonFunctionalRequirement_returns403_whenUserLacksPermission() {
        NonFunctionalRequirement nfr = nfrRepository.save(
                buildNfr("OldName", RequirementState.APPROVED, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));

        var patch = new NonFunctionalRequirementDTO(
                null, null, "NewName", null, 0L,
                null, null, null, null, null,
                null, activeProject.getId(), null, null, null,null,null,null);

        var response = patch(
                STAKEHOLDER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/" + nfr.getId() + "/modify",
                patch,
                NonFunctionalRequirementDTO.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
    }

    // ════════════════════════════════════════════════════════════════════════
    // PATCH /{id}/reorder
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void reorder_returns200() {
        NonFunctionalRequirement nfr = nfrRepository.save(
                buildNfr("nfr", RequirementState.APPROVED, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));

        allowEdit(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var response = patch(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/" + nfr.getId() + "/reorder",
                3L,
                Void.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
    }

    // ════════════════════════════════════════════════════════════════════════
    // PATCH /{id}/changeParent
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void changeParent_assignsNewParent() {
        NonFunctionalRequirement parent = nfrRepository.save(
                buildNfr("parent", RequirementState.APPROVED, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));
        NonFunctionalRequirement child = nfrRepository.save(
                buildNfr("child", RequirementState.APPROVED, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));

        allowEdit(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var response = patch(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/" + child.getId() + "/changeParent",
                parent.getId(),
                Void.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(reload(child, activeProject).getParent().getId()).isEqualTo(parent.getId());
    }

    @Test
    void changeParent_toNull_removesParent() {
        NonFunctionalRequirement parent = nfrRepository.save(
                buildNfr("parent", RequirementState.APPROVED, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));
        NonFunctionalRequirement child = nfrRepository.save(
                buildNfr("child", RequirementState.APPROVED, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));

        Associations.link(parent, child);
        nfrRepository.save(child);

        allowEdit(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var response = patch(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/" + child.getId() + "/changeParent",
                null,
                Void.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(reload(child, activeProject).getParent()).isNull();
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /approve
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void approveNonFunctionalRequirements_changesStateToApproved() {
        NonFunctionalRequirement nfr1 = nfrRepository.save(
                buildNfr("nfr1", RequirementState.PENDING_APPROVAL, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));
        NonFunctionalRequirement nfr2 = nfrRepository.save(
                buildNfr("nfr2", RequirementState.PENDING_APPROVAL, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));

        allowEditProject(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/approve",
                List.of(nfr1.getId(), nfr2.getId()),
                Void.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(reload(nfr1, activeProject).getState()).isEqualTo(RequirementState.APPROVED);
        assertThat(reload(nfr2, activeProject).getState()).isEqualTo(RequirementState.APPROVED);
    }

    @Test
    void approveNonFunctionalRequirements_returns403_whenUserLacksEditProjectPermission() {
        NonFunctionalRequirement nfr = nfrRepository.save(
                buildNfr("nfr", RequirementState.PENDING_APPROVAL, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));

        allowView(REQUIREMENT_ENGINEER_1_ORY_ID, activeProject.getId());

        var response = post(
                REQUIREMENT_ENGINEER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/approve",
                List.of(nfr.getId()),
                Void.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /finish
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void finishNonFunctionalRequirements_changesStateToFinished() {
        NonFunctionalRequirement nfr = nfrRepository.save(
                buildNfr("nfr", RequirementState.APPROVED, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 1.0));

        allowEditProject(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/finish",
                List.of(nfr.getId()),
                Void.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(reload(nfr, activeProject).getState()).isEqualTo(RequirementState.FINISHED);
    }
    @Test
    void finishNonFunctionalRequirements_nonPassing_notChangesStateToFinished() {
        NonFunctionalRequirement nfr = nfrRepository.save(
                buildNfr("nfr", RequirementState.APPROVED, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));

        allowEditProject(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/finish",
                List.of(nfr.getId()),
                Void.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(500);
        assertThat(reload(nfr, activeProject).getState()).isEqualTo(RequirementState.APPROVED);
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /disable
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void disableNonFunctionalRequirements_changesStateToDeactivated() {
        NonFunctionalRequirement nfr = nfrRepository.save(
                buildNfr("nfr", RequirementState.APPROVED, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));

        allowEdit(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/disable",
                List.of(nfr.getId()),
                Void.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(reload(nfr, activeProject).getState()).isEqualTo(RequirementState.DEACTIVATED);
    }

    @Test
    void disableNonFunctionalRequirements_returns403_whenUserLacksPermission() {
        NonFunctionalRequirement nfr = nfrRepository.save(
                buildNfr("nfr", RequirementState.APPROVED, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));

        var response = post(
                STAKEHOLDER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/disable",
                List.of(nfr.getId()),
                Void.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
    }

    @Test
    void disableNonFunctionalRequirements_doesNotAffectNfrsFromOtherProjects() {
        Project otherProject = projectRepository.save(buildProject("other", ProjectState.ACTIVE));
        NonFunctionalRequirement otherNfr = nfrRepository.save(
                buildNfr("other-nfr", RequirementState.APPROVED, otherProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));

        allowEdit(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/disable",
                List.of(otherNfr.getId()),
                Void.class,
                activeProject.getId()
        );

        assertThat(reload(otherNfr, otherProject).getState()).isEqualTo(RequirementState.APPROVED);
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /enable
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void enableNonFunctionalRequirements_changesStateToPendingApproval() {
        NonFunctionalRequirement nfr = nfrRepository.save(
                buildNfr("nfr", RequirementState.DEACTIVATED, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));

        allowEdit(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/enable",
                List.of(nfr.getId()),
                Void.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(reload(nfr, activeProject).getState()).isEqualTo(RequirementState.PENDING_APPROVAL);
    }

    @Test
    void enableNonFunctionalRequirements_returns403_whenUserLacksPermission() {
        NonFunctionalRequirement nfr = nfrRepository.save(
                buildNfr("nfr", RequirementState.DEACTIVATED, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));

        var response = post(
                STAKEHOLDER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/enable",
                List.of(nfr.getId()),
                Void.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /remove
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void removeNonFunctionalRequirements_changesStateToRemoved() {
        NonFunctionalRequirement nfr = nfrRepository.save(
                buildNfr("nfr", RequirementState.DEACTIVATED, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));

        allowEdit(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/remove",
                List.of(nfr.getId()),
                Void.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(reload(nfr, activeProject).getState()).isEqualTo(RequirementState.REMOVED);
    }

    @Test
    void removeNonFunctionalRequirements_returns403_whenUserLacksPermission() {
        NonFunctionalRequirement nfr = nfrRepository.save(
                buildNfr("nfr", RequirementState.DEACTIVATED, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));

        var response = post(
                STAKEHOLDER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/remove",
                List.of(nfr.getId()),
                Void.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /delete
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void deleteNonFunctionalRequirements_removesFromDatabase() {
        NonFunctionalRequirement nfr = nfrRepository.save(
                buildNfr("nfr", RequirementState.REMOVED, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));

        allowEditProject(SYSTEM_ADMIN_1_ORY_ID, activeProject.getId());

        var response = post(
                SYSTEM_ADMIN_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/delete",
                List.of(nfr.getId()),
                Void.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(nfrRepository.findByIdAndProjectId(nfr.getId(), activeProject.getId())).isEmpty();
    }

    @Test
    void deleteNonFunctionalRequirements_returns403() {
        NonFunctionalRequirement nfr = nfrRepository.save(
                buildNfr("nfr", RequirementState.REMOVED, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/delete",
                List.of(nfr.getId()),
                Void.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
        assertThat(nfrRepository.findByIdAndProjectId(nfr.getId(), activeProject.getId())).isPresent();
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /{id}/linkStakeholder  &  unlinkStakeholder
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void linkStakeholder_addsObservation() {
        NonFunctionalRequirement nfr = nfrRepository.save(
                buildNfr("nfr", RequirementState.APPROVED, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));
        Stakeholder stk = stakeholderRepository.save(
                buildStakeholder("stk", EntityState.APPROVED, activeProject));

        allowEdit(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/" + nfr.getId() + "/linkStakeholder",
                stk.getId(),
                Void.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(stakeholderRepository.findAllObservedByRequirement(nfr.getId()))
                .contains(stk);
    }

    @Test
    void unlinkStakeholder_removesObservation() {
        NonFunctionalRequirement nfr = nfrRepository.save(
                buildNfr("nfr", RequirementState.APPROVED, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));
        Stakeholder stk = stakeholderRepository.save(
                buildStakeholder("stk", EntityState.APPROVED, activeProject));

        Associations.observe(nfr, stk);
        nfrRepository.save(nfr);

        allowEdit(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/" + nfr.getId() + "/unlinkStakeholder",
                stk.getId(),
                Void.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(stakeholderRepository.findAllObservedByRequirement(nfr.getId()))
                .doesNotContain(stk);
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /{id}/linkDocument  &  unlinkDocument
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void linkDocument_addsObservation() {
        NonFunctionalRequirement nfr = nfrRepository.save(
                buildNfr("nfr", RequirementState.APPROVED, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));
        Document doc = documentRepository.save(
                buildDocument("spec.pdf", "spec-key", EntityState.APPROVED, activeProject));

        allowEdit(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/" + nfr.getId() + "/linkDocument",
                doc.getId(),
                Void.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(documentRepository.findAllObservedByRequirement(nfr.getId()))
                .contains(doc);
    }

    @Test
    void unlinkDocument_removesObservation() {
        NonFunctionalRequirement nfr = nfrRepository.save(
                buildNfr("nfr", RequirementState.APPROVED, activeProject, ComparisonOperator.EQUAL_TO, 1.0, 1.0, 0.0));
        Document doc = documentRepository.save(
                buildDocument("spec.pdf", "spec-key", EntityState.APPROVED, activeProject));

        Associations.observe(nfr, doc);
        nfrRepository.save(nfr);

        allowEdit(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/" + nfr.getId() + "/unlinkDocument",
                doc.getId(),
                Void.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(documentRepository.findAllObservedByRequirement(nfr.getId()))
                .doesNotContain(doc);
    }

    // ════════════════════════════════════════════════════════════════════════
    // Lifecycle: create → approve → finish → disable → enable → remove → delete
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void fullNonFunctionalRequirementLifecycle() {
        allowEdit(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());
        allowEditProject(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());
        allowEditProject(SYSTEM_ADMIN_1_ORY_ID, activeProject.getId());

        var created = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/new",
                new NonFunctionalRequirementDTO(
                        null, null, "Lifecycle NFR", "desc", 0L, RequirementState.PENDING_APPROVAL.name(),
                        "ms", ComparisonOperator.LESS_THAN.name(), 200.0, 100.0, 0.0,
                        activeProject.getId(),null,null,null,null,null,null),
                NonFunctionalRequirementDTO.class,
                activeProject.getId()
        );
        assertThat(created.getStatusCode().value()).isEqualTo(201);
        Long nfrId = created.getBody().id();
        NonFunctionalRequirement nfr = nfrRepository.findByIdAndProjectId(nfrId, activeProject.getId()).orElseThrow();

        post(PROJECT_MANAGER_1_ORY_ID, "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/approve",
                List.of(nfrId), Void.class, activeProject.getId());
        assertThat(reload(nfr, activeProject).getState()).isEqualTo(RequirementState.APPROVED);

        post(PROJECT_MANAGER_1_ORY_ID, "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/finish",
                List.of(nfrId), Void.class, activeProject.getId());
        assertThat(reload(nfr, activeProject).getState()).isEqualTo(RequirementState.FINISHED);

        get(PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/" + nfr.getId() + "/requestEdit",
                Void.class, activeProject.getId());

        var patch = new NonFunctionalRequirementDTO(
                null, null, "NewName", null, 0L,
                null, null, null, null, null,
                null, activeProject.getId(), null, null, null,null,null,null);

        patch(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/" + nfr.getId() + "/modify",
                patch,
                NonFunctionalRequirementDTO.class,
                activeProject.getId()
        );

        post(PROJECT_MANAGER_1_ORY_ID, "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/disable",
                List.of(nfrId), Void.class, activeProject.getId());
        assertThat(reload(nfr, activeProject).getState()).isEqualTo(RequirementState.DEACTIVATED);

        post(PROJECT_MANAGER_1_ORY_ID, "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/enable",
                List.of(nfrId), Void.class, activeProject.getId());
        assertThat(reload(nfr, activeProject).getState()).isEqualTo(RequirementState.PENDING_APPROVAL);

        post(PROJECT_MANAGER_1_ORY_ID, "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/disable",
                List.of(nfrId), Void.class, activeProject.getId());

        post(PROJECT_MANAGER_1_ORY_ID, "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/remove",
                List.of(nfrId), Void.class, activeProject.getId());
        assertThat(reload(nfr, activeProject).getState()).isEqualTo(RequirementState.REMOVED);

        post(SYSTEM_ADMIN_1_ORY_ID, "/v1/projects/" + activeProject.getId() + "/nonFunctionalRequirements/delete",
                List.of(nfrId), Void.class, activeProject.getId());
        assertThat(nfrRepository.findByIdAndProjectId(nfrId, activeProject.getId())).isEmpty();
    }
}