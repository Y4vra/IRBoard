package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.dtos.ProjectDTO;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.enums.*;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class ProjectControllerTest extends IrBoardBaseTest{

        protected Project disabledProject;

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
        }

}