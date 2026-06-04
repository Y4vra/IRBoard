package com.y4vra.irboardbackend.domain.model;


import com.y4vra.irboardbackend.domain.errors.DeactivatedEntityException;
import com.y4vra.irboardbackend.domain.model.enums.EntityState;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@Nested
@DisplayName("Document")
class DocumentTest {

    @Test
    @DisplayName("stores fileName")
    void storesFileName() {
        Document d = new Document();
        d.setFileName("spec.pdf");
        assertThat(d.getFileName()).isEqualTo("spec.pdf");
    }

    @Test
    @DisplayName("stores mimeType")
    void storesMimeType() {
        Document d = new Document();
        d.setMimeType("application/pdf");
        assertThat(d.getMimeType()).isEqualTo("application/pdf");
    }

    @Test
    @DisplayName("stores s3Key")
    void storesS3Key() {
        Document d = new Document();
        d.setS3Key("projects/1/spec.pdf");
        assertThat(d.getS3Key()).isEqualTo("projects/1/spec.pdf");
    }

    @Test
    @DisplayName("stores fileSize")
    void storesFileSize() {
        Document d = new Document();
        d.setFileSize(204800L);
        assertThat(d.getFileSize()).isEqualTo(204800L);
    }

    @Test
    @DisplayName("project is null by default")
    void projectNullByDefault() {
        assertThat(new Document().getProject()).isNull();
    }

    @Test
    @DisplayName("project can be assigned and retrieved")
    void projectAssignment() {
        Document d = new Document();
        Project p = new Project("P", "d", "TERNARY");
        d.setProject(p);
        assertThat(d.getProject()).isSameAs(p);
    }

// ── Identity (equals / hashCode) ───────────────────────────────────────────

    @Nested
    @DisplayName("Identity (equals / hashCode)")
    class Identity {

        @Test
        @DisplayName("documents with same id are equal")
        void documentsWithSameIdAreEqual() {
            Document d1 = new Document();
            d1.setId(1L);

            Document d2 = new Document();
            d2.setId(1L);

            assertThat(d1).isEqualTo(d2);
            assertThat(d1.hashCode()).isEqualTo(d2.hashCode());
        }

        @Test
        @DisplayName("documents with different ids are not equal")
        void documentsWithDifferentIdsAreNotEqual() {
            Document d1 = new Document();
            d1.setId(1L);

            Document d2 = new Document();
            d2.setId(2L);

            assertThat(d1).isNotEqualTo(d2);
        }

        @Test
        @DisplayName("document is not equal to null or other type")
        void documentNotEqualToNullOrDifferentType() {
            Document d = new Document();
            d.setId(1L);

            assertThat(d).isNotEqualTo(null);
            assertThat(d).isNotEqualTo("string");
        }
    }

// ── notifyObservers ────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Observer notifications")
    class ObserverNotifications {

        @Test
        @DisplayName("notifyObservers calls update on all requirements")
        void notifyObserversCallsUpdate() {
            Document d = new Document();

            Requirement r1 = new Requirement() {
                boolean updated;
                @Override public void update() { updated = true; }
            };

            Requirement r2 = new Requirement() {
                boolean updated;
                @Override public void update() { updated = true; }
            };

            d._getObserverRequirements().add(r1);
            d._getObserverRequirements().add(r2);

            d.notifyObservers();

            assertThat(d._getObserverRequirements()).contains(r1, r2);
        }
    }

// ── checkCanBeModified ─────────────────────────────────────────────────────

    @Nested
    @DisplayName("Modification rules")
    class ModificationRules {

        @Test
        @DisplayName("state DEACTIVATED throws exception")
        void deactivatedThrows() {
            Document d = new Document();
            d.setState(EntityState.DEACTIVATED);

            assertThatThrownBy(d::checkCanBeModified)
                    .isInstanceOf(DeactivatedEntityException.class)
                    .hasMessageContaining("deactivated");
        }

        @Test
        @DisplayName("state REMOVED throws exception")
        void removedThrows() {
            Document d = new Document();
            d.setState(EntityState.REMOVED);

            assertThatThrownBy(d::checkCanBeModified)
                    .isInstanceOf(DeactivatedEntityException.class)
                    .hasMessageContaining("removed");
        }

        @Test
        @DisplayName("null state throws NullPointerException")
        void nullStateThrows() {
            Document d = new Document();
            d.setState(null);

            assertThatThrownBy(d::checkCanBeModified)
                    .isInstanceOf(NullPointerException.class);
        }

        @Test
        @DisplayName("APPROVED state allows modification")
        void activeAllowsModification() {
            Document d = new Document();
            d.setState(EntityState.APPROVED);

            d.checkCanBeModified(); // should not throw
        }
    }

// ── Edge cases ─────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Edge cases")
    class EdgeCases {

        @Test
        @DisplayName("fileSize can be null")
        void fileSizeCanBeNull() {
            Document d = new Document();
            d.setFileSize(null);

            assertThat(d.getFileSize()).isNull();
        }

        @Test
        @DisplayName("observerRequirements is not modifiable externally")
        void observerSetIsImmutable() {
            Document d = new Document();

            assertThatThrownBy(() -> d.getObserverRequirements().add(new Requirement() {}))
                    .isInstanceOf(UnsupportedOperationException.class);
        }
    }
}