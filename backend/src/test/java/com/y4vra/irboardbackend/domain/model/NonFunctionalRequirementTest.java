package com.y4vra.irboardbackend.domain.model;

import com.y4vra.irboardbackend.domain.model.enums.ComparisonOperator;
import com.y4vra.irboardbackend.domain.model.enums.RequirementState;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

@DisplayName("NonFunctionalRequirement")
class NonFunctionalRequirementTest {

    private NonFunctionalRequirement newNFR(String name) {
        NonFunctionalRequirement nfr = new NonFunctionalRequirement();
        nfr.setName(name);
        return nfr;
    }

    // ── Inherited fields (Requirement) ────────────────────────────────────────

    @Nested
    @DisplayName("Inherited fields")
    class InheritedFields {

        @Test
        @DisplayName("stores name")
        void storesName() {
            assertThat(newNFR("Response time").getName()).isEqualTo("Response time");
        }

        @Test
        @DisplayName("stores description")
        void storesDescription() {
            NonFunctionalRequirement nfr = newNFR("NFR-01");
            nfr.setDescription("Response time under 200ms");
            assertThat(nfr.getDescription()).isEqualTo("Response time under 200ms");
        }

        @Test
        @DisplayName("stores orderValue")
        void storesOrderValue() {
            NonFunctionalRequirement nfr = newNFR("NFR-01");
            nfr.setOrderValue(2.0f);
            assertThat(nfr.getOrderValue()).isEqualTo(2.0f);
        }

        @Test
        @DisplayName("stores isPendingReview flag")
        void storesIsPendingReview() {
            NonFunctionalRequirement nfr = newNFR("NFR-01");
            nfr.setIsPendingReview(true);
            assertThat(nfr.getIsPendingReview()).isTrue();
        }
    }

    // ── State transitions ─────────────────────────────────────────────────────

    @Nested
    @DisplayName("State transitions")
    class StateTransitions {

        @Test
        @DisplayName("can be set to PENDING_APPROVAL")
        void state_pendingApproval() {
            NonFunctionalRequirement nfr = newNFR("NFR-01");
            nfr.setState(RequirementState.PENDING_APPROVAL);
            assertThat(nfr.getState()).isEqualTo(RequirementState.PENDING_APPROVAL);
        }

        @Test
        @DisplayName("can be set to APPROVED")
        void state_approved() {
            NonFunctionalRequirement nfr = newNFR("NFR-01");
            nfr.setState(RequirementState.APPROVED);
            assertThat(nfr.getState()).isEqualTo(RequirementState.APPROVED);
        }

        @Test
        @DisplayName("can be set to FINISHED")
        void state_finished() {
            NonFunctionalRequirement nfr = newNFR("NFR-01");
            nfr.setState(RequirementState.FINISHED);
            assertThat(nfr.getState()).isEqualTo(RequirementState.FINISHED);
        }

        @Test
        @DisplayName("can be set to REMOVED")
        void state_removed() {
            NonFunctionalRequirement nfr = newNFR("NFR-01");
            nfr.setState(RequirementState.REMOVED);
            assertThat(nfr.getState()).isEqualTo(RequirementState.REMOVED);
        }
    }

    // ── Own fields ────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Own fields")
    class OwnFields {

        @Test
        @DisplayName("stores measurementUnit")
        void storesMeasurementUnit() {
            NonFunctionalRequirement nfr = newNFR("NFR-01");
            nfr.setMeasurementUnit("ms");
            assertThat(nfr.getMeasurementUnit()).isEqualTo("ms");
        }

        @Test
        @DisplayName("stores thresholdValue")
        void storesThresholdValue() {
            NonFunctionalRequirement nfr = newNFR("NFR-01");
            nfr.setThresholdValue(200.0);
            assertThat(nfr.getThresholdValue()).isEqualTo(200.0);
        }

        @Test
        @DisplayName("stores targetValue")
        void storesTargetValue() {
            NonFunctionalRequirement nfr = newNFR("NFR-01");
            nfr.setTargetValue(100.0);
            assertThat(nfr.getTargetValue()).isEqualTo(100.0);
        }

        @Test
        @DisplayName("stores actualValue")
        void storesActualValue() {
            NonFunctionalRequirement nfr = newNFR("NFR-01");
            nfr.setActualValue(150.0);
            assertThat(nfr.getActualValue()).isEqualTo(150.0);
        }

        @Test
        @DisplayName("project is null by default")
        void projectNullByDefault() {
            assertThat(newNFR("NFR-01").getProject()).isNull();
        }

        @Test
        @DisplayName("project can be assigned via Associations")
        void projectAssignedViaAssociations() {
            Project p = new Project("P", "d", "TERNARY");
            NonFunctionalRequirement nfr = newNFR("NFR-01");
            Associations.link(p, nfr);
            assertThat(nfr.getProject()).isSameAs(p);
        }
    }

    // ── ComparisonOperator ────────────────────────────────────────────────────

    @Nested
    @DisplayName("ComparisonOperator")
    class OperatorTests {

        @Test
        @DisplayName("stores EQUAL_TO")
        void storesEqualTo() {
            NonFunctionalRequirement nfr = newNFR("NFR-01");
            nfr.setOperator(ComparisonOperator.EQUAL_TO);
            assertThat(nfr.getOperator()).isEqualTo(ComparisonOperator.EQUAL_TO);
        }

        @Test
        @DisplayName("stores LESS_THAN")
        void storesLessThan() {
            NonFunctionalRequirement nfr = newNFR("NFR-01");
            nfr.setOperator(ComparisonOperator.LESS_THAN);
            assertThat(nfr.getOperator()).isEqualTo(ComparisonOperator.LESS_THAN);
        }

        @Test
        @DisplayName("stores GREATER_THAN")
        void storesGreaterThan() {
            NonFunctionalRequirement nfr = newNFR("NFR-01");
            nfr.setOperator(ComparisonOperator.GREATER_THAN);
            assertThat(nfr.getOperator()).isEqualTo(ComparisonOperator.GREATER_THAN);
        }

        @Test
        @DisplayName("operator is null by default")
        void operatorNullByDefault() {
            assertThat(newNFR("NFR-01").getOperator()).isNull();
        }
    }
}
