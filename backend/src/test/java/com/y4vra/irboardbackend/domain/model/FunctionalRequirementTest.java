package com.y4vra.irboardbackend.domain.model;

import com.y4vra.irboardbackend.domain.model.enums.RequirementState;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

@DisplayName("FunctionalRequirement")
class FunctionalRequirementTest {

    private FunctionalRequirement newFR(String name) {
        FunctionalRequirement fr = new FunctionalRequirement();
        fr.setName(name);
        return fr;
    }

    // ── Inherited fields (Requirement) ────────────────────────────────────────

    @Nested
    @DisplayName("Inherited fields")
    class InheritedFields {

        @Test
        @DisplayName("stores name")
        void storesName() {
            assertThat(newFR("User login").getName()).isEqualTo("User login");
        }

        @Test
        @DisplayName("stores description")
        void storesDescription() {
            FunctionalRequirement fr = newFR("FR-01");
            fr.setDescription("The system shall allow login");
            assertThat(fr.getDescription()).isEqualTo("The system shall allow login");
        }

        @Test
        @DisplayName("stores orderValue")
        void storesOrderValue() {
            FunctionalRequirement fr = newFR("FR-01");
            fr.setOrderValue(1.5f);
            assertThat(fr.getOrderValue()).isEqualTo(1.5f);
        }

        @Test
        @DisplayName("stores isPendingReview flag")
        void storesIsPendingReview() {
            FunctionalRequirement fr = newFR("FR-01");
            fr.setIsPendingReview(true);
            assertThat(fr.getIsPendingReview()).isTrue();
        }
    }

    // ── State transitions ─────────────────────────────────────────────────────

    @Nested
    @DisplayName("State transitions")
    class StateTransitions {

        @Test
        @DisplayName("can be set to PENDING_APPROVAL")
        void state_pendingApproval() {
            FunctionalRequirement fr = newFR("FR-01");
            fr.setState(RequirementState.PENDING_APPROVAL);
            assertThat(fr.getState()).isEqualTo(RequirementState.PENDING_APPROVAL);
        }

        @Test
        @DisplayName("can be set to APPROVED")
        void state_approved() {
            FunctionalRequirement fr = newFR("FR-01");
            fr.setState(RequirementState.APPROVED);
            assertThat(fr.getState()).isEqualTo(RequirementState.APPROVED);
        }

        @Test
        @DisplayName("can be set to FINISHED")
        void state_finished() {
            FunctionalRequirement fr = newFR("FR-01");
            fr.setState(RequirementState.FINISHED);
            assertThat(fr.getState()).isEqualTo(RequirementState.FINISHED);
        }

        @Test
        @DisplayName("can be set to REMOVED")
        void state_removed() {
            FunctionalRequirement fr = newFR("FR-01");
            fr.setState(RequirementState.REMOVED);
            assertThat(fr.getState()).isEqualTo(RequirementState.REMOVED);
        }
    }

    // ── Children collection ───────────────────────────────────────────────────

    @Nested
    @DisplayName("Children collection defensiveness")
    class ChildrenCollection {

        @Test
        @DisplayName("children starts empty")
        void children_startsEmpty() {
            assertThat(newFR("FR").getChildren()).isEmpty();
        }

        @Test
        @DisplayName("getChildren returns a copy, not the internal set")
        void getChildren_returnsCopy() {
            FunctionalRequirement parent = newFR("Parent");
            FunctionalRequirement child = newFR("Child");
            Associations.link(parent, child);

            parent.getChildren().clear();

            assertThat(parent.getChildren()).contains(child);
        }
    }

    // ── Own fields ────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Own fields")
    class OwnFields {

        @Test
        @DisplayName("stores priority")
        void storesPriority() {
            FunctionalRequirement fr = newFR("FR-01");
            fr.setPriority("HIGH");
            assertThat(fr.getPriority()).isEqualTo("HIGH");
        }

        @Test
        @DisplayName("stores stability")
        void storesStability() {
            FunctionalRequirement fr = newFR("FR-01");
            fr.setStability("STABLE");
            assertThat(fr.getStability()).isEqualTo("STABLE");
        }

        @Test
        @DisplayName("functionality is null by default")
        void functionality_nullByDefault() {
            assertThat(newFR("FR-01").getFunctionality()).isNull();
        }

        @Test
        @DisplayName("functionality can be assigned via Associations")
        void functionality_assignedViaAssociations() {
            Functionality f = new Functionality();
            f.setName("Auth");
            FunctionalRequirement fr = newFR("FR-01");
            Associations.link(f, fr);
            assertThat(fr.getFunctionality()).isSameAs(f);
        }
    }
}
