package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.FunctionalityDTO;
import com.y4vra.irboardbackend.domain.model.*;
import com.y4vra.irboardbackend.domain.model.enums.*;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class FunctionalityControllerTest extends IrBoardBaseTest {

    @Override
    void setUp() {
        // no extra seed data required beyond what IrBoardBaseTest provides
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /new
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void createFunctionality_returns201_andPersists() {
        allowEditProject(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var body = new FunctionalityDTO(null,null , "Payments", "Payment module", "PAY", null,  activeProject.getId(), null);

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities" + "/new",
                body,
                FunctionalityDTO.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(201);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().id()).isNotNull();
        assertThat(response.getBody().name()).isEqualTo("Payments");
        assertThat(functionalityRepository.findByIdAndProjectId(
                response.getBody().id(), activeProject.getId())).isPresent();
    }

    @Test
    void createFunctionality_returns403_whenUserLacksEditPermission() {
        // no allowEdit — ketoClient returns false by default
        var body = new FunctionalityDTO(null, "Payments", "Payment module", "PAY", null, null, activeProject.getId(), null);

        var response = post(
                STAKEHOLDER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities" + "/new",
                body,
                FunctionalityDTO.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
    }

    // ════════════════════════════════════════════════════════════════════════
    // GET /{functionalityId}
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void getFunctionalityById_returnsCorrectFunctionality() {
        Functionality f = functionalityRepository.save(
                buildFunctionality("Auth", FunctionalityState.ACTIVE, activeProject));

        allowViewRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, f.getId());

        var response = get(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/" + f.getId(),
                FunctionalityDTO.class,
                activeProject.getId(), f.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().id()).isEqualTo(f.getId());
        assertThat(response.getBody().name()).isEqualTo("Auth");
    }

    @Test
    void getFunctionalityById_returns403_whenUserLacksPermission() {
        Functionality f = functionalityRepository.save(
                buildFunctionality("Auth", FunctionalityState.ACTIVE, activeProject));

        // no permission stubs

        var response = get(
                STAKEHOLDER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/" + f.getId(),
                FunctionalityDTO.class,
                activeProject.getId(), f.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
    }

    @Test
    void getFunctionalityById_returns404_whenNotFound() {
        allowView(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var response = get(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/999999",
                FunctionalityDTO.class,
                activeProject.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(404);
    }

    // ════════════════════════════════════════════════════════════════════════
    // GET /{functionalityId}/requestEdit
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void requestEdit_returns200() {
        Functionality f = functionalityRepository.save(
                buildFunctionality("Billing", FunctionalityState.ACTIVE, activeProject));

        allowEditProject(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());
        allowEditRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, f.getId());

        var response = get(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/" + f.getId() + "/requestEdit",
                Void.class,
                activeProject.getId(), f.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
    }

    // ════════════════════════════════════════════════════════════════════════
    // PATCH /{functionalityId}/modify
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void modifyFunctionality_updatesName() {
        Functionality f = functionalityRepository.save(
                buildFunctionality("OldName", FunctionalityState.ACTIVE, activeProject));

        allowEdit(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());
        allowEditProject(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());
        allowEditRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, f.getId());

        // acquire the lock first
        get(PROJECT_MANAGER_1_ORY_ID, "/v1/projects/"+activeProject.getId()+"/functionalities/" + f.getId() + "/requestEdit",
                Void.class, activeProject.getId(), f.getId());

        var patch = new FunctionalityDTO(null,null, "NewName", null, null, null, activeProject.getId(), null);

        var response = patch(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/" + f.getId() + "/modify",
                patch,
                FunctionalityDTO.class,
                activeProject.getId(), f.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(reload(f, activeProject).getName()).isEqualTo("NewName");
        assertThat(response.getBody().name()).isEqualTo("NewName");
    }

    @Test
    void modifyFunctionality_returns403_whenUserLacksPermission() {
        Functionality f = functionalityRepository.save(
                buildFunctionality("OldName", FunctionalityState.ACTIVE, activeProject));

        var patch = new FunctionalityDTO(null, "NewName", null, null, null, null, activeProject.getId(), null);

        var response = patch(
                STAKEHOLDER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/" + f.getId() + "/modify",
                patch,
                FunctionalityDTO.class,
                activeProject.getId(), f.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /{functionalityId}/disable
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void disableFunctionality_changesStateToDeactivated() {
        Functionality f = functionalityRepository.save(
                buildFunctionality("Search", FunctionalityState.ACTIVE, activeProject));

        allowEditProject(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());
        allowEditRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, f.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/" + f.getId() + "/disable",
                null,
                Void.class,
                activeProject.getId(), f.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(reload(f, activeProject).getState()).isEqualTo(FunctionalityState.DEACTIVATED);
    }

    @Test
    void disableFunctionality_returns403_whenUserLacksEditPermission() {
        Functionality f = functionalityRepository.save(
                buildFunctionality("Search", FunctionalityState.ACTIVE, activeProject));

        var response = post(
                STAKEHOLDER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/" + f.getId() + "/disable",
                null,
                Void.class,
                activeProject.getId(), f.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /{functionalityId}/enable
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void enableFunctionality_changesStateToPendingApproval() {
        Functionality f = functionalityRepository.save(
                buildFunctionality("Search", FunctionalityState.DEACTIVATED, activeProject));

        allowEditProject(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/" + f.getId() + "/enable",
                null,
                Void.class,
                activeProject.getId(), f.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(reload(f, activeProject).getState()).isEqualTo(FunctionalityState.ACTIVE);
    }

    @Test
    void enableFunctionality_returns403_whenUserLacksEditPermission() {
        Functionality f = functionalityRepository.save(
                buildFunctionality("Search", FunctionalityState.DEACTIVATED, activeProject));

        var response = post(
                STAKEHOLDER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/" + f.getId() + "/enable",
                null,
                Void.class,
                activeProject.getId(), f.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /{functionalityId}/remove
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void removeFunctionality_changesStateToRemoved() {
        Functionality f = functionalityRepository.save(
                buildFunctionality("Legacy", FunctionalityState.DEACTIVATED, activeProject));

        allowEditProject(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());
        allowEditRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, f.getId());

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/" + f.getId() + "/remove",
                null,
                Void.class,
                activeProject.getId(), f.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(reload(f, activeProject).getState()).isEqualTo(FunctionalityState.REMOVED);
    }

    @Test
    void removeFunctionality_returns403_whenUserLacksEditPermission() {
        Functionality f = functionalityRepository.save(
                buildFunctionality("Legacy", FunctionalityState.DEACTIVATED, activeProject));

        var response = post(
                STAKEHOLDER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/" + f.getId() + "/remove",
                null,
                Void.class,
                activeProject.getId(), f.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /{functionalityId}/delete
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void deleteFunctionality_removesFromDatabase() {
        Functionality f = functionalityRepository.save(
                buildFunctionality("ToDelete", FunctionalityState.REMOVED, activeProject));

        allowEditProject(SYSTEM_ADMIN_1_ORY_ID, activeProject.getId());

        var response = post(
                SYSTEM_ADMIN_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/" + f.getId() + "/delete",
                null,
                Void.class,
                activeProject.getId(), f.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(functionalityRepository.findByIdAndProjectId(f.getId(), activeProject.getId())).isEmpty();
    }

    @Test
    void deleteFunctionality_returns403_whenNonManager() {
        Functionality f = functionalityRepository.save(
                buildFunctionality("ToDelete", FunctionalityState.REMOVED, activeProject));

        var response = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/" + f.getId() + "/delete",
                null,
                Void.class,
                activeProject.getId(), f.getId()
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
        assertThat(functionalityRepository.findByIdAndProjectId(f.getId(), activeProject.getId())).isPresent();
    }

    // ════════════════════════════════════════════════════════════════════════
    // Lifecycle: create → disable → enable → remove → delete
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void fullFunctionalityLifecycle() {
        allowEditProject(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());
        allowEdit(PROJECT_MANAGER_1_ORY_ID, activeProject.getId());
        allowEditProject(SYSTEM_ADMIN_1_ORY_ID, activeProject.getId());
        allowEdit(SYSTEM_ADMIN_1_ORY_ID, activeProject.getId());

        // create
        var created = post(
                PROJECT_MANAGER_1_ORY_ID,
                "/v1/projects/"+activeProject.getId()+"/functionalities/new",
                new FunctionalityDTO(null, "Lifecycle", "desc", "LFC", null, null, activeProject.getId(), null),
                FunctionalityDTO.class,
                activeProject.getId()
        );
        assertThat(created.getStatusCode().value()).isEqualTo(201);
        Long fId = created.getBody().id();
        Functionality f = functionalityRepository.findByIdAndProjectId(fId, activeProject.getId()).orElseThrow();

        allowEditRequirementsOfFunctionality(PROJECT_MANAGER_1_ORY_ID, f.getId());

        // disable
        post(PROJECT_MANAGER_1_ORY_ID, "/v1/projects/"+activeProject.getId()+"/functionalities/" + f.getId() + "/disable",
                null, Void.class, activeProject.getId(), fId);
        assertThat(reload(f, activeProject).getState()).isEqualTo(FunctionalityState.DEACTIVATED);

        // enable
        post(PROJECT_MANAGER_1_ORY_ID, "/v1/projects/"+activeProject.getId()+"/functionalities/" + f.getId() + "/enable",
                null, Void.class, activeProject.getId(), fId);
        assertThat(reload(f, activeProject).getState()).isIn(
                FunctionalityState.ACTIVE, FunctionalityState.ACTIVE);

        // disable again before remove
        post(PROJECT_MANAGER_1_ORY_ID, "/v1/projects/"+activeProject.getId()+"/functionalities/" + f.getId() + "/disable",
                null, Void.class, activeProject.getId(), fId);

        // remove
        post(PROJECT_MANAGER_1_ORY_ID, "/v1/projects/"+activeProject.getId()+"/functionalities/" + f.getId() + "/remove",
                null, Void.class, activeProject.getId(), fId);
        assertThat(reload(f, activeProject).getState()).isEqualTo(FunctionalityState.REMOVED);

        // delete (admin only)
        post(SYSTEM_ADMIN_1_ORY_ID, "/v1/projects/"+activeProject.getId()+"/functionalities/" + f.getId() + "/delete",
                null, Void.class, activeProject.getId(), fId);
        assertThat(functionalityRepository.findByIdAndProjectId(fId, activeProject.getId())).isEmpty();
    }
}