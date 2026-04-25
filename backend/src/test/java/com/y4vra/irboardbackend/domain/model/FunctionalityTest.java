package com.y4vra.irboardbackend.domain.model;

import com.y4vra.irboardbackend.domain.model.enums.EntityState;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

@DisplayName("Functionality")
class FunctionalityTest {

    // ── Fields ────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Fields")
    class Fields {

        @Test
        @DisplayName("stores name")
        void storesName() {
            Functionality f = new Functionality();
            f.setName("Authentication");
            assertThat(f.getName()).isEqualTo("Authentication");
        }

        @Test
        @DisplayName("stores label")
        void storesLabel() {
            Functionality f = new Functionality();
            f.setLabel("AUTH");
            assertThat(f.getLabel()).isEqualTo("AUTH");
        }

        @Test
        @DisplayName("stores ACTIVE state")
        void storesActiveState() {
            Functionality f = new Functionality();
            f.setState(EntityState.ACTIVE);
            assertThat(f.getState()).isEqualTo(EntityState.ACTIVE);
        }

        @Test
        @DisplayName("stores DEACTIVATED state")
        void storesDeactivatedState() {
            Functionality f = new Functionality();
            f.setState(EntityState.DEACTIVATED);
            assertThat(f.getState()).isEqualTo(EntityState.DEACTIVATED);
        }

        @Test
        @DisplayName("stores REMOVED state")
        void storesRemovedState() {
            Functionality f = new Functionality();
            f.setState(EntityState.REMOVED);
            assertThat(f.getState()).isEqualTo(EntityState.REMOVED);
        }

        @Test
        @DisplayName("project is null by default")
        void projectNullByDefault() {
            assertThat(new Functionality().getProject()).isNull();
        }
    }

    // ── Requirements collection ───────────────────────────────────────────────

    @Nested
    @DisplayName("Requirements collection defensiveness")
    class RequirementsCollection {

        @Test
        @DisplayName("getRequirements returns a copy, not the internal set")
        void getRequirements_returnsCopy() {
            Functionality f = new Functionality();
            FunctionalRequirement fr = new FunctionalRequirement();
            Associations.link(f, fr);

            // mutating the copy must not affect internal state
            f.getRequirements().clear();

            assertThat(f.getRequirements()).contains(fr);
        }

        @Test
        @DisplayName("requirements starts empty")
        void requirements_startsEmpty() {
            assertThat(new Functionality().getRequirements()).isEmpty();
        }

        @Test
        @DisplayName("can hold multiple requirements after linking")
        void requirements_holdsMultiple() {
            Functionality f = new Functionality();
            FunctionalRequirement fr1 = new FunctionalRequirement();
            FunctionalRequirement fr2 = new FunctionalRequirement();
            Associations.link(f, fr1);
            Associations.link(f, fr2);

            assertThat(f.getRequirements()).containsExactlyInAnyOrder(fr1, fr2);
        }
    }
}
