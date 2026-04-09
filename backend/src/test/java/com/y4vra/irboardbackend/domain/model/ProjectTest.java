package com.y4vra.irboardbackend.domain.model;

import com.y4vra.irboardbackend.domain.model.enums.PriorityStyle;
import com.y4vra.irboardbackend.domain.model.enums.ProjectState;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

@DisplayName("Project")
class ProjectTest {

    // ── Construction ──────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Constructor")
    class Construction {

        @Test
        @DisplayName("sets state to ACTIVE on creation")
        void newProject_stateIsActive() {
            Project p = new Project("My Project", "desc", "TERNARY");
            assertThat(p.getState()).isEqualTo(ProjectState.ACTIVE);
        }

        @Test
        @DisplayName("sets createdAt on creation")
        void newProject_createdAtIsSet() {
            Project p = new Project("My Project", "desc", "TERNARY");
            assertThat(p.getCreatedAt()).isNotNull();
        }

        @Test
        @DisplayName("defaults priorityStyle to TERNARY when null is provided")
        void newProject_nullPriorityStyle_defaultsToTernary() {
            Project p = new Project("My Project", "desc", null);
            assertThat(p.getPriorityStyle()).isEqualTo(PriorityStyle.TERNARY);
        }

        @Test
        @DisplayName("sets MOSCOW priority style when provided")
        void newProject_moscowPriorityStyle() {
            Project p = new Project("My Project", "desc", "MOSCOW");
            assertThat(p.getPriorityStyle()).isEqualTo(PriorityStyle.MOSCOW);
        }

        @Test
        @DisplayName("is case-insensitive for priorityStyle")
        void newProject_priorityStyleCaseInsensitive() {
            Project p = new Project("My Project", "desc", "moscow");
            assertThat(p.getPriorityStyle()).isEqualTo(PriorityStyle.MOSCOW);
        }

        @Test
        @DisplayName("throws IllegalArgumentException for invalid priorityStyle")
        void newProject_invalidPriorityStyle_throws() {
            assertThatThrownBy(() -> new Project("My Project", "desc", "INVALID"))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("stores name and description")
        void newProject_storesNameAndDescription() {
            Project p = new Project("Board v2", "A new board", "TERNARY");
            assertThat(p.getName()).isEqualTo("Board v2");
            assertThat(p.getDescription()).isEqualTo("A new board");
        }
    }

    // ── Collections defensiveness ─────────────────────────────────────────────

    @Nested
    @DisplayName("Collection defensiveness")
    class CollectionDefensiveness {

        @Test
        @DisplayName("getFunctionalities returns an immutable copy")
        void getFunctionalities_returnsImmutableView() {
            Project p = new Project("P", "d", "TERNARY");
            assertThatThrownBy(() -> p.getFunctionalities().add(new Functionality()))
                    .isInstanceOf(UnsupportedOperationException.class);
        }

        @Test
        @DisplayName("getStakeholders returns an immutable copy")
        void getStakeholders_returnsImmutableView() {
            Project p = new Project("P", "d", "TERNARY");
            assertThatThrownBy(() -> p.getStakeholders().add(new Stakeholder()))
                    .isInstanceOf(UnsupportedOperationException.class);
        }

        @Test
        @DisplayName("getNonFunctionalRequirements returns an immutable copy")
        void getNonFunctionalRequirements_returnsImmutableView() {
            Project p = new Project("P", "d", "TERNARY");
            assertThatThrownBy(() -> p.getNonFunctionalRequirements().add(new NonFunctionalRequirement()))
                    .isInstanceOf(UnsupportedOperationException.class);
        }

        @Test
        @DisplayName("getDocuments returns an immutable copy")
        void getDocuments_returnsImmutableView() {
            Project p = new Project("P", "d", "TERNARY");
            assertThatThrownBy(() -> p.getDocuments().add(new Document()))
                    .isInstanceOf(UnsupportedOperationException.class);
        }

        @Test
        @DisplayName("internal collections start empty")
        void newProject_collectionsStartEmpty() {
            Project p = new Project("P", "d", "TERNARY");
            assertThat(p.getFunctionalities()).isEmpty();
            assertThat(p.getStakeholders()).isEmpty();
            assertThat(p.getNonFunctionalRequirements()).isEmpty();
            assertThat(p.getDocuments()).isEmpty();
        }
    }

    // ── State transitions ─────────────────────────────────────────────────────

    @Nested
    @DisplayName("State transitions")
    class StateTransitions {

        @Test
        @DisplayName("can be set to FINISHED")
        void setState_finished() {
            Project p = new Project("P", "d", "TERNARY");
            p.setState(ProjectState.FINISHED);
            assertThat(p.getState()).isEqualTo(ProjectState.FINISHED);
        }

        @Test
        @DisplayName("can be set to DEACTIVATED")
        void setState_deactivated() {
            Project p = new Project("P", "d", "TERNARY");
            p.setState(ProjectState.DEACTIVATED);
            assertThat(p.getState()).isEqualTo(ProjectState.DEACTIVATED);
        }

        @Test
        @DisplayName("can be set to REMOVED")
        void setState_removed() {
            Project p = new Project("P", "d", "TERNARY");
            p.setState(ProjectState.REMOVED);
            assertThat(p.getState()).isEqualTo(ProjectState.REMOVED);
        }
    }
}
