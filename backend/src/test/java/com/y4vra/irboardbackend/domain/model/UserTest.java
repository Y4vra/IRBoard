package com.y4vra.irboardbackend.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

@DisplayName("User")
class UserTest {

    // ── Defaults ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Defaults on construction")
    class Defaults {

        @Test
        @DisplayName("active defaults to true")
        void activeDefaultsToTrue() {
            User u = new User();
            assertThat(u.getActive()).isTrue();
        }

        @Test
        @DisplayName("isAdmin defaults to false")
        void isAdminDefaultsToFalse() {
            User u = new User();
            assertThat(u.getIsAdmin()).isFalse();
        }

        @Test
        @DisplayName("pendingActivationToken is null by default")
        void tokenNullByDefault() {
            assertThat(new User().getPendingActivationToken()).isNull();
        }
    }

    // ── Fields ────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Fields")
    class Fields {

        @Test
        @DisplayName("stores oryId")
        void storesOryId() {
            User u = new User();
            u.setOryId("abc-123");
            assertThat(u.getOryId()).isEqualTo("abc-123");
        }

        @Test
        @DisplayName("stores email")
        void storesEmail() {
            User u = new User();
            u.setEmail("admin@irboard.com");
            assertThat(u.getEmail()).isEqualTo("admin@irboard.com");
        }

        @Test
        @DisplayName("stores name and surname")
        void storesNameAndSurname() {
            User u = new User();
            u.setName("Javier");
            u.setSurname("García");
            assertThat(u.getName()).isEqualTo("Javier");
            assertThat(u.getSurname()).isEqualTo("García");
        }

        @Test
        @DisplayName("can be deactivated")
        void canBeDeactivated() {
            User u = new User();
            u.setActive(false);
            assertThat(u.getActive()).isFalse();
        }

        @Test
        @DisplayName("can be promoted to admin")
        void canBePromotedToAdmin() {
            User u = new User();
            u.setIsAdmin(true);
            assertThat(u.getIsAdmin()).isTrue();
        }

        @Test
        @DisplayName("stores pendingActivationToken")
        void storesActivationToken() {
            User u = new User();
            u.setPendingActivationToken("tok-xyz-999");
            assertThat(u.getPendingActivationToken()).isEqualTo("tok-xyz-999");
        }
    }
    // ── Identity (equals / hashCode) ───────────────────────────────────────────

    @Nested
    @DisplayName("Identity (equals / hashCode)")
    class Identity {

        @Test
        @DisplayName("users with same id and oryId are equal")
        void usersWithSameIdAndOryIdAreEqual() {
            User u1 = new User();
            u1.setId(1L);
            u1.setOryId("abc");

            User u2 = new User();
            u2.setId(1L);
            u2.setOryId("abc");

            assertThat(u1).isEqualTo(u2);
            assertThat(u1.hashCode()).isEqualTo(u2.hashCode());
        }

        @Test
        @DisplayName("users with different id or oryId are not equal")
        void usersWithDifferentIdentityAreNotEqual() {
            User u1 = new User();
            u1.setId(1L);
            u1.setOryId("abc");

            User u2 = new User();
            u2.setId(2L);
            u2.setOryId("abc");

            User u3 = new User();
            u3.setId(1L);
            u3.setOryId("xyz");

            assertThat(u1).isNotEqualTo(u2);
            assertThat(u1).isNotEqualTo(u3);
        }

        @Test
        @DisplayName("user is not equal to null or different type")
        void userNotEqualToNullOrDifferentType() {
            User u = new User();
            u.setId(1L);
            u.setOryId("abc");

            assertThat(u).isNotEqualTo(null);
            assertThat(u).isNotEqualTo("string");
        }
    }

// ── Defaults edge cases ────────────────────────────────────────────────────

    @Nested
    @DisplayName("Default behavior edge cases")
    class DefaultEdgeCases {

        @Test
        @DisplayName("active can be explicitly set to null (no validation in entity)")
        void activeCanBeSetToNull() {
            User u = new User();
            u.setActive(null);

            assertThat(u.getActive()).isNull();
        }

        @Test
        @DisplayName("isAdmin can be explicitly set to null (no validation in entity)")
        void isAdminCanBeSetToNull() {
            User u = new User();
            u.setIsAdmin(null);

            assertThat(u.getIsAdmin()).isNull();
        }
    }
}
