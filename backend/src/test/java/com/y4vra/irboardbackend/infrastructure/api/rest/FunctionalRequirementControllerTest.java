package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.FunctionalRequirementDTO;
import com.y4vra.irboardbackend.domain.model.*;
import com.y4vra.irboardbackend.domain.model.enums.*;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class FunctionalRequirementControllerTest extends IrBoardBaseTest {

    Functionality functionality;

    @Override
    void setUp() {
        functionality = functionalityRepository.save(
                buildFunctionality("Core", FunctionalityState.ACTIVE, activeProject));
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /new
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void createFunctionalRequirement_returns201_andPersists() {
        allowEditRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, functionality.getId());

        var body = new FunctionalRequirementDTO(
                null, null, "Login flow", "User must be able to log in", "HIGH", "STABLE",
                null, null, 0L, null,null, null, null,null,null);

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/new",
                body,
                FunctionalRequirementDTO.class,
                activeProject.getId(), functionality.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(201);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().id()).isNotNull();
        assertThat(response.getBody().name()).isEqualTo("Login flow");
        assertThat(frRepository.findByIdAndFunctionalityIdAndProjectId(
                response.getBody().id(), functionality.getId(), activeProject.getId())).isPresent();
    }

    @Test
    void createFunctionalRequirement_returns403_whenUserLacksEditRequirementsPermission() {
        var body = new FunctionalRequirementDTO(
                null, null, "Login flow", "desc", "HIGH", "STABLE",
                null, null, 0L, null, null, null, null,null,null);

        var response = post(
                STAKEHOLDER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/new",
                body,
                FunctionalRequirementDTO.class,
                activeProject.getId(), functionality.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
    }

    // ════════════════════════════════════════════════════════════════════════
    // GET /
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void getFunctionalRequirementsNotRemoved_returnsOnlyNonRemoved() {
        FunctionalRequirement active = frRepository.save(
                buildFr("active-fr", RequirementState.APPROVED, activeProject, functionality));
        FunctionalRequirement pending = frRepository.save(
                buildFr("pending-fr", RequirementState.PENDING_APPROVAL, activeProject, functionality));
        FunctionalRequirement removed = frRepository.save(
                buildFr("removed-fr", RequirementState.REMOVED, activeProject, functionality));

        allowViewRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, functionality.getId());

        var response = get(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/",
                new ParameterizedTypeReference<List<FunctionalRequirementDTO>>() {},
                activeProject.getId(), functionality.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().stream().map(FunctionalRequirementDTO::id))
                .contains(active.getId(), pending.getId())
                .doesNotContain(removed.getId());
    }

    @Test
    void getFunctionalRequirementsNotRemoved_returns403_whenUserLacksPermission() {
        var response = get(
                STAKEHOLDER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/",
                Void.class,
                activeProject.getId(), functionality.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
    }

    @Test
    void getFunctionalRequirementsNotRemoved_doesNotReturnRequirementsFromOtherFunctionalities() {
        Functionality otherFunc = functionalityRepository.save(
                buildFunctionality("Other", FunctionalityState.ACTIVE, activeProject));
        FunctionalRequirement ownFr = frRepository.save(
                buildFr("own", RequirementState.APPROVED, activeProject, functionality));
        FunctionalRequirement otherFr = frRepository.save(
                buildFr("other", RequirementState.APPROVED, activeProject, otherFunc));

        allowViewRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, functionality.getId());

        var response = get(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/",
                new ParameterizedTypeReference<List<FunctionalRequirementDTO>>() {},
                activeProject.getId(), functionality.getId()
        );

        assertThat(response.getBody().stream().map(FunctionalRequirementDTO::id))
                .contains(ownFr.getId())
                .doesNotContain(otherFr.getId());
    }

    // ════════════════════════════════════════════════════════════════════════
    // GET /removed
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void getRemovedFunctionalRequirements_returnsOnlyRemoved() {
        FunctionalRequirement active = frRepository.save(
                buildFr("active-fr", RequirementState.APPROVED, activeProject, functionality));
        FunctionalRequirement removed = frRepository.save(
                buildFr("removed-fr", RequirementState.REMOVED, activeProject, functionality));

        allowEditProject(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());
        allowView(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());
        allowEditRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, functionality.getId());
        allowViewRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, functionality.getId());

        var response = get(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/removed",
                new ParameterizedTypeReference<List<FunctionalRequirementDTO>>() {},
                activeProject.getId(), functionality.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().stream().map(FunctionalRequirementDTO::id))
                .contains(removed.getId())
                .doesNotContain(active.getId());
    }

    @Test
    void getRemovedFunctionalRequirements_returns403_whenUserLacksPermission() {
        var response = get(
                STAKEHOLDER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/removed",
                Void.class,
                activeProject.getId(), functionality.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
    }

    // ════════════════════════════════════════════════════════════════════════
    // GET /{functionalRequirementId}
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void getFunctionalRequirementById_returnsCorrectRequirement() {
        FunctionalRequirement fr = frRepository.save(
                buildFr("login", RequirementState.APPROVED, activeProject, functionality));

        allowViewRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, functionality.getId());

        var response = get(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/" + fr.getId() + "",
                FunctionalRequirementDTO.class,
                activeProject.getId(), functionality.getId(), fr.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().id()).isEqualTo(fr.getId());
        assertThat(response.getBody().name()).isEqualTo("login");
    }

    @Test
    void getFunctionalRequirementById_returns404_whenNotFound() {
        allowViewRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, functionality.getId());

        var response = get(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/999999",
                FunctionalRequirementDTO.class,
                activeProject.getId(), functionality.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(404);
    }

    @Test
    void getFunctionalRequirementById_returns403_whenUserLacksPermission() {
        FunctionalRequirement fr = frRepository.save(
                buildFr("login", RequirementState.APPROVED, activeProject, functionality));

        var response = get(
                STAKEHOLDER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/" + fr.getId() + "",
                FunctionalRequirementDTO.class,
                activeProject.getId(), functionality.getId(), fr.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
    }

    // ════════════════════════════════════════════════════════════════════════
    // GET /{functionalRequirementId}/requestEdit
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void requestEdit_returns200() {
        FunctionalRequirement fr = frRepository.save(
                buildFr("login", RequirementState.APPROVED, activeProject, functionality));

        allowEditProject(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());
        allowEditRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, functionality.getId());

        var response = get(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/" + fr.getId() + "/requestEdit",
                Void.class,
                activeProject.getId(), functionality.getId(), fr.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
    }

    // ════════════════════════════════════════════════════════════════════════
    // PATCH /{functionalRequirementId}/modify
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void modifyFunctionalRequirement_updatesName() {
        FunctionalRequirement fr = frRepository.save(
                buildFr("OldName", RequirementState.APPROVED, activeProject, functionality));

        allowEdit(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());
        allowEditProject(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());
        allowEditRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, functionality.getId());
        allowViewRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, functionality.getId());

        // acquire lock first
        get(PROJECT_MANAGER_1_ORY_ID, "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/" + fr.getId() + "/requestEdit",
                Void.class, activeProject.getId(), functionality.getId(), fr.getId());

        var patch = new FunctionalRequirementDTO(
                null, null, "NewName", null, "HIGH", null,
                null, null, 0L, null, null, null, null, null, null);

        var response = patch(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/" + fr.getId() + "/modify",
                patch,
                FunctionalRequirementDTO.class,
                activeProject.getId(), functionality.getId(), fr.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().name()).isEqualTo("NewName");
        assertThat(reload(fr, functionality, activeProject).getName()).isEqualTo("NewName");
    }

    @Test
    void modifyFunctionalRequirement_returns403_whenUserLacksPermission() {
        FunctionalRequirement fr = frRepository.save(
                buildFr("OldName", RequirementState.APPROVED, activeProject, functionality));

        var patch = new FunctionalRequirementDTO(
                null, null, "NewName", null, null, null,
                null, null, 0L, null, null, null, null, null, null);

        var response = patch(
                STAKEHOLDER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/" + fr.getId() + "/modify",
                patch,
                FunctionalRequirementDTO.class,
                activeProject.getId(), functionality.getId(), fr.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
    }

    // ════════════════════════════════════════════════════════════════════════
    // PATCH /{functionalRequirementId}/changeParent
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void changeParent_assignsNewParent() {
        FunctionalRequirement parent = frRepository.save(
                buildFr("parent", RequirementState.APPROVED, activeProject, functionality));
        FunctionalRequirement child = frRepository.save(
                buildFr("child", RequirementState.APPROVED, activeProject, functionality));

        allowEditRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, functionality.getId());

        var response = patch(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/" + child.getId() + "/changeParent",
                parent.getId(),
                Void.class,
                activeProject.getId(), functionality.getId(), child.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        FunctionalRequirement reloaded = reload(child, functionality, activeProject);
        assertThat(reloaded.getParent()).isNotNull();
        assertThat(reloaded.getParent().getId()).isEqualTo(parent.getId());
    }

    @Test
    void changeParent_toNull_removesParent() {
        FunctionalRequirement parent = frRepository.save(
                buildFr("parent", RequirementState.APPROVED, activeProject, functionality));
        FunctionalRequirement child = frRepository.save(
                buildFr("child", RequirementState.APPROVED, activeProject, functionality));

        Associations.link(parent, child);
        frRepository.save(child);

        allowEditRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, functionality.getId());

        var response = patch(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/" + child.getId() + "/changeParent",
                null,
                Void.class,
                activeProject.getId(), functionality.getId(), child.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(reload(child, functionality, activeProject).getParent()).isNull();
    }

    // ════════════════════════════════════════════════════════════════════════
    // PATCH /{functionalRequirementId}/reorder
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void reorder_returns200_andChangesOrderValue() {
        FunctionalRequirement fr = frRepository.save(
                buildFr("reorderable", RequirementState.APPROVED, activeProject, functionality));

        allowEditRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, functionality.getId());

        var response = patch(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/" + fr.getId() + "/reorder",
                5L,
                Void.class,
                activeProject.getId(), functionality.getId(), fr.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /approve
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void approveFunctionalRequirements_changesStateToApproved() {
        FunctionalRequirement fr1 = frRepository.save(
                buildFr("fr1", RequirementState.PENDING_APPROVAL, activeProject, functionality));
        FunctionalRequirement fr2 = frRepository.save(
                buildFr("fr2", RequirementState.PENDING_APPROVAL, activeProject, functionality));

        allowEditProject(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/approve",
                List.of(fr1.getId(), fr2.getId()),
                Void.class,
                activeProject.getId(), functionality.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(reload(fr1, functionality, activeProject).getState()).isEqualTo(RequirementState.APPROVED);
        assertThat(reload(fr2, functionality, activeProject).getState()).isEqualTo(RequirementState.APPROVED);
    }

    @Test
    void approveFunctionalRequirements_returns403_whenUserLacksEditProjectPermission() {
        FunctionalRequirement fr = frRepository.save(
                buildFr("fr", RequirementState.PENDING_APPROVAL, activeProject, functionality));

        allowViewRequirementsOfFunctionality(REQUIREMENT_ENGINEER_1_ORY_ID, functionality.getId());

        var response = post(
                REQUIREMENT_ENGINEER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/approve",
                List.of(fr.getId()),
                Void.class,
                activeProject.getId(), functionality.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /finish
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void finishFunctionalRequirements_changesStateToFinished() {
        FunctionalRequirement fr = frRepository.save(
                buildFr("fr", RequirementState.APPROVED, activeProject, functionality));

        allowEditProject(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/finish",
                List.of(fr.getId()),
                Void.class,
                activeProject.getId(), functionality.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(reload(fr, functionality, activeProject).getState()).isEqualTo(RequirementState.FINISHED);
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /disable
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void disableFunctionalRequirements_changesStateToDeactivated() {
        FunctionalRequirement fr = frRepository.save(
                buildFr("fr", RequirementState.APPROVED, activeProject, functionality));

        allowEditRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, functionality.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/disable",
                List.of(fr.getId()),
                Void.class,
                activeProject.getId(), functionality.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(reload(fr, functionality, activeProject).getState()).isEqualTo(RequirementState.DEACTIVATED);
    }

    @Test
    void disableFunctionalRequirements_returns403_whenUserLacksPermission() {
        FunctionalRequirement fr = frRepository.save(
                buildFr("fr", RequirementState.APPROVED, activeProject, functionality));

        var response = post(
                STAKEHOLDER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/disable",
                List.of(fr.getId()),
                Void.class,
                activeProject.getId(), functionality.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /enable
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void enableFunctionalRequirements_changesStateToPendingApproval() {
        FunctionalRequirement fr = frRepository.save(
                buildFr("fr", RequirementState.DEACTIVATED, activeProject, functionality));

        allowEditRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, functionality.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/enable",
                List.of(fr.getId()),
                Void.class,
                activeProject.getId(), functionality.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(reload(fr, functionality, activeProject).getState()).isEqualTo(RequirementState.PENDING_APPROVAL);
    }

    @Test
    void enableFunctionalRequirements_returns403_whenUserLacksPermission() {
        FunctionalRequirement fr = frRepository.save(
                buildFr("fr", RequirementState.DEACTIVATED, activeProject, functionality));

        var response = post(
                STAKEHOLDER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/enable",
                List.of(fr.getId()),
                Void.class,
                activeProject.getId(), functionality.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /remove
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void removeFunctionalRequirements_changesStateToRemoved() {
        FunctionalRequirement fr = frRepository.save(
                buildFr("fr", RequirementState.DEACTIVATED, activeProject, functionality));

        allowEditRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, functionality.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/remove",
                List.of(fr.getId()),
                Void.class,
                activeProject.getId(), functionality.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(reload(fr, functionality, activeProject).getState()).isEqualTo(RequirementState.REMOVED);
    }

    @Test
    void removeFunctionalRequirements_doesNotAffectRequirementsFromOtherFunctionalities() {
        Functionality otherFunc = functionalityRepository.save(
                buildFunctionality("Other", FunctionalityState.ACTIVE, activeProject));
        FunctionalRequirement otherFr = frRepository.save(
                buildFr("other", RequirementState.DEACTIVATED, activeProject, otherFunc));

        allowEditRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, functionality.getId());

        post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/remove",
                List.of(otherFr.getId()),  // belongs to otherFunc
                Void.class,
                activeProject.getId(), functionality.getId()  // scoped to functionality
        );

        assertThat(reload(otherFr, otherFunc, activeProject).getState()).isEqualTo(RequirementState.DEACTIVATED);
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /delete
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void deleteFunctionalRequirements_removesFromDatabase() {
        FunctionalRequirement fr = frRepository.save(
                buildFr("fr", RequirementState.REMOVED, activeProject, functionality));

        allowEditProject(SYSTEM_ADMIN_1_ORY_ID, activeProject.getId());

        var response = post(
                SYSTEM_ADMIN_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/delete",
                List.of(fr.getId()),
                Void.class,
                activeProject.getId(), functionality.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(frRepository.findByIdAndFunctionalityIdAndProjectId(
                fr.getId(), functionality.getId(), activeProject.getId())).isEmpty();
    }

    @Test
    void deleteFunctionalRequirements_returns403_whenNonAdmin() {
        FunctionalRequirement fr = frRepository.save(
                buildFr("fr", RequirementState.REMOVED, activeProject, functionality));

        allowEditRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, functionality.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/delete",
                List.of(fr.getId()),
                Void.class,
                activeProject.getId(), functionality.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
        assertThat(frRepository.findByIdAndFunctionalityIdAndProjectId(
                fr.getId(), functionality.getId(), activeProject.getId())).isPresent();
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /{id}/linkStakeholder  &  unlinkStakeholder
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void linkStakeholder_addsObservation() {
        FunctionalRequirement fr = frRepository.save(
                buildFr("fr", RequirementState.APPROVED, activeProject, functionality));
        Stakeholder stk = stakeholderRepository.save(
                buildStakeholder("stk", EntityState.APPROVED, activeProject));

        allowEditRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, functionality.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/" + fr.getId() + "/linkStakeholder",
                stk.getId(),
                Void.class,
                activeProject.getId(), functionality.getId(), fr.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        FunctionalRequirement reloaded = reload(fr, functionality, activeProject);
        assertThat(stakeholderRepository.findAllObservedByRequirement(fr.getId()))
                .contains(stk);
    }

    @Test
    void unlinkStakeholder_removesObservation() {
        FunctionalRequirement fr = frRepository.save(
                buildFr("fr", RequirementState.APPROVED, activeProject, functionality));
        Stakeholder stk = stakeholderRepository.save(
                buildStakeholder("stk", EntityState.APPROVED, activeProject));

        Associations.observe(fr, stk);
        frRepository.save(fr);

        allowEditRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, functionality.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/" + fr.getId() + "/unlinkStakeholder",
                stk.getId(),
                Void.class,
                activeProject.getId(), functionality.getId(), fr.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200); // as we need to have the stakeholders eagerly loaded
        assertThat(stakeholderRepository.findAllObservedByRequirement(fr.getId()))
                .doesNotContain(stk);
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /{id}/linkDocument  &  unlinkDocument
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void linkDocument_addsObservation() {
        FunctionalRequirement fr = frRepository.save(
                buildFr("fr", RequirementState.APPROVED, activeProject, functionality));
        Document doc = documentRepository.save(
                buildDocument("spec.pdf", "spec-key", EntityState.APPROVED, activeProject));

        allowEditRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, functionality.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/" + fr.getId() + "/linkDocument",
                doc.getId(),
                Void.class,
                activeProject.getId(), functionality.getId(), fr.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(documentRepository.findAllObservedByRequirement(fr.getId()))
                .contains(doc);
    }

    @Test
    void unlinkDocument_removesObservation() {
        FunctionalRequirement fr = frRepository.save(
                buildFr("fr", RequirementState.APPROVED, activeProject, functionality));
        Document doc = documentRepository.save(
                buildDocument("spec.pdf", "spec-key", EntityState.APPROVED, activeProject));

        Associations.observe(fr, doc);
        frRepository.save(fr);

        allowEditRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, functionality.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/" + fr.getId() + "/unlinkDocument",
                doc.getId(),
                Void.class,
                activeProject.getId(), functionality.getId(), fr.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        FunctionalRequirement reloaded = reload(fr, functionality, activeProject);
        assertThat(documentRepository.findAllObservedByRequirement(fr.getId()))
                .doesNotContain(doc);
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /{id}/linkRequirement  &  unlinkRequirement
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void linkRequirement_addsObservation() {
        FunctionalRequirement fr = frRepository.save(
                buildFr("fr", RequirementState.APPROVED, activeProject, functionality));
        NonFunctionalRequirement nfr = nfrRepository.save(
                buildNfr("perf", RequirementState.APPROVED, activeProject,
                        ComparisonOperator.LESS_THAN, 200.0, 100.0, 90.0));

        allowEditRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, functionality.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/" + fr.getId() + "/linkRequirement",
                nfr.getId(),
                Void.class,
                activeProject.getId(), functionality.getId(), fr.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(nfrRepository.findAllObservedByRequirement(fr.getId()))
                .contains(nfr);
    }

    @Test
    void unlinkRequirement_removesObservation() {
        FunctionalRequirement fr = frRepository.save(
                buildFr("fr", RequirementState.APPROVED, activeProject, functionality));
        NonFunctionalRequirement nfr = nfrRepository.save(
                buildNfr("perf", RequirementState.APPROVED, activeProject,
                        ComparisonOperator.LESS_THAN, 200.0, 100.0, 90.0));

        Associations.observe(fr, nfr);
        frRepository.save(fr);

        allowEditRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, functionality.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/" + fr.getId() + "/unlinkRequirement",
                nfr.getId(),
                Void.class,
                activeProject.getId(), functionality.getId(), fr.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        FunctionalRequirement reloaded = reload(fr, functionality, activeProject);
        assertThat(nfrRepository.findAllObservedByRequirement(fr.getId()))
                .doesNotContain(nfr);
    }

    // ════════════════════════════════════════════════════════════════════════
    // Lifecycle: create → approve → finish → disable → enable → remove → delete
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void fullFunctionalRequirementLifecycle() {
        allowEditRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, functionality.getId());
        allowEditProject(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());
        allowEditProject(SYSTEM_ADMIN_1_ORY_ID, activeProject.getId());

        // create
        var created = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/new",
                new FunctionalRequirementDTO(null, null, "Lifecycle FR", "desc", "HIGH", "STABLE",
                        null, null, 0L, null, null, null, null, null, null),
                FunctionalRequirementDTO.class,
                activeProject.getId(), functionality.getId()
        );
        assertThat(created.getStatusCode().value()).isEqualTo(201);
        Long frId = created.getBody().id();
        FunctionalRequirement fr = frRepository.findByIdAndFunctionalityIdAndProjectId(
                frId, functionality.getId(), activeProject.getId()).orElseThrow();

        // approve
        post(PROJECT_MANAGER_1_ORY_ID, "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/approve", List.of(frId), Void.class,
                activeProject.getId(), functionality.getId());
        assertThat(reload(fr, functionality, activeProject).getState()).isEqualTo(RequirementState.APPROVED);

        // finish
        post(PROJECT_MANAGER_1_ORY_ID, "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/finish", List.of(frId), Void.class,
                activeProject.getId(), functionality.getId());
        assertThat(reload(fr, functionality, activeProject).getState()).isEqualTo(RequirementState.FINISHED);

        // acquire lock first
        get(PROJECT_MANAGER_1_ORY_ID, "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/" + fr.getId() + "/requestEdit",
                Void.class, activeProject.getId(), functionality.getId(), fr.getId());

        var patch = new FunctionalRequirementDTO(
                null, null, "NewName", null, "HIGH", null,
                null, null, 0L, null, null, null, null, null, null);

        patch(PROJECT_MANAGER_1_ORY_ID,"/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/" + fr.getId() + "/modify",patch,FunctionalRequirementDTO.class,activeProject.getId(), functionality.getId(), fr.getId());

        // disable
        post(PROJECT_MANAGER_1_ORY_ID, "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/disable", List.of(frId), Void.class,
                activeProject.getId(), functionality.getId());
        assertThat(reload(fr, functionality, activeProject).getState()).isEqualTo(RequirementState.DEACTIVATED);

        // enable
        post(PROJECT_MANAGER_1_ORY_ID, "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/enable", List.of(frId), Void.class,
                activeProject.getId(), functionality.getId());
        assertThat(reload(fr, functionality, activeProject).getState()).isEqualTo(RequirementState.PENDING_APPROVAL);

        // disable again before remove
        post(PROJECT_MANAGER_1_ORY_ID, "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/disable", List.of(frId), Void.class,
                activeProject.getId(), functionality.getId());

        // remove
        post(PROJECT_MANAGER_1_ORY_ID, "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/remove", List.of(frId), Void.class,
                activeProject.getId(), functionality.getId());
        assertThat(reload(fr, functionality, activeProject).getState()).isEqualTo(RequirementState.REMOVED);

        // delete (admin only)
        post(SYSTEM_ADMIN_1_ORY_ID, "/v1/projects/"+activeProject.getId()+"/functionalities/"+functionality.getId()+"/functionalRequirements/delete", List.of(frId), Void.class,
                activeProject.getId(), functionality.getId());
        assertThat(frRepository.findByIdAndFunctionalityIdAndProjectId(
                frId, functionality.getId(), activeProject.getId())).isEmpty();
    }
}