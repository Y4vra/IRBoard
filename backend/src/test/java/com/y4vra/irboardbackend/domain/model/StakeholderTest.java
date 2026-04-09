package com.y4vra.irboardbackend.domain.model;


import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@Nested
@DisplayName("Stakeholder")
class StakeholderTest {

    @Test
    @DisplayName("stores name")
    void storesName() {
        Stakeholder s = new Stakeholder();
        s.setName("Product Owner");
        assertThat(s.getName()).isEqualTo("Product Owner");
    }

    @Test
    @DisplayName("stores description")
    void storesDescription() {
        Stakeholder s = new Stakeholder();
        s.setDescription("Main decision maker");
        assertThat(s.getDescription()).isEqualTo("Main decision maker");
    }

    @Test
    @DisplayName("project is null by default")
    void projectNullByDefault() {
        assertThat(new Stakeholder().getProject()).isNull();
    }

    @Test
    @DisplayName("project can be assigned and retrieved")
    void projectAssignment() {
        Stakeholder s = new Stakeholder();
        Project p = new Project("P", "d", "TERNARY");
        s.setProject(p);
        assertThat(s.getProject()).isSameAs(p);
    }
}
