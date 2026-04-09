package com.y4vra.irboardbackend.domain.model;

import com.y4vra.irboardbackend.domain.model.enums.FunctionalityState;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

@DisplayName("Associations")
class AssociationsTest {

    private Project project;

    @BeforeEach
    void setUp() {
        project = new Project("Test Project", "description", "TERNARY");
    }

    // ── Project <-> Functionality ─────────────────────────────────────────────

    @Nested
    @DisplayName("Project <-> Functionality")
    class ProjectFunctionality {

        @Test
        @DisplayName("link sets project on functionality and adds it to project")
        void link_functionalityBelongsToProject() {
            Functionality f = new Functionality();
            f.setName("Login");

            Associations.link(project, f);

            assertThat(f.getProject()).isSameAs(project);
            assertThat(project.getFunctionalities()).contains(f);
        }

        @Test
        @DisplayName("unlink removes functionality from project and nullifies its project")
        void unlink_functionalityRemovedFromProject() {
            Functionality f = new Functionality();
            Associations.link(project, f);

            Associations.unlink(project, f);

            assertThat(f.getProject()).isNull();
            assertThat(project.getFunctionalities()).doesNotContain(f);
        }

        @Test
        @DisplayName("linking multiple functionalities to the same project")
        void link_multipleFunctionalities() {
            Functionality f1 = new Functionality();
            Functionality f2 = new Functionality();
            Associations.link(project, f1);
            Associations.link(project, f2);

            assertThat(project.getFunctionalities()).containsExactlyInAnyOrder(f1, f2);
        }

        @Test
        @DisplayName("unlinking one functionality does not affect others")
        void unlink_doesNotAffectOtherFunctionalities() {
            Functionality f1 = new Functionality();
            Functionality f2 = new Functionality();
            Associations.link(project, f1);
            Associations.link(project, f2);

            Associations.unlink(project, f1);

            assertThat(project.getFunctionalities()).containsOnly(f2);
        }
    }

    // ── Project <-> Stakeholder ───────────────────────────────────────────────

    @Nested
    @DisplayName("Project <-> Stakeholder")
    class ProjectStakeholder {

        @Test
        @DisplayName("link sets project on stakeholder and adds it to project")
        void link_stakeholderBelongsToProject() {
            Stakeholder s = new Stakeholder();
            s.setName("Product Owner");

            Associations.link(project, s);

            assertThat(s.getProject()).isSameAs(project);
            assertThat(project.getStakeholders()).contains(s);
        }

        @Test
        @DisplayName("unlink removes stakeholder from project and nullifies its project")
        void unlink_stakeholderRemovedFromProject() {
            Stakeholder s = new Stakeholder();
            Associations.link(project, s);

            Associations.unlink(project, s);

            assertThat(s.getProject()).isNull();
            assertThat(project.getStakeholders()).doesNotContain(s);
        }
    }

    // ── Project <-> NonFunctionalRequirement ─────────────────────────────────

    @Nested
    @DisplayName("Project <-> NonFunctionalRequirement")
    class ProjectNFR {

        @Test
        @DisplayName("link sets project on NFR and adds it to project")
        void link_nfrBelongsToProject() {
            NonFunctionalRequirement nfr = new NonFunctionalRequirement();
            nfr.setName("Response time < 200ms");

            Associations.link(project, nfr);

            assertThat(nfr.getProject()).isSameAs(project);
            assertThat(project.getNonFunctionalRequirements()).contains(nfr);
        }

        @Test
        @DisplayName("unlink removes NFR from project and nullifies its project")
        void unlink_nfrRemovedFromProject() {
            NonFunctionalRequirement nfr = new NonFunctionalRequirement();
            Associations.link(project, nfr);

            Associations.unlink(project, nfr);

            assertThat(nfr.getProject()).isNull();
            assertThat(project.getNonFunctionalRequirements()).doesNotContain(nfr);
        }
    }

    // ── Project <-> Document ──────────────────────────────────────────────────

    @Nested
    @DisplayName("Project <-> Document")
    class ProjectDocument {

        @Test
        @DisplayName("link sets project on document and adds it to project")
        void link_documentBelongsToProject() {
            Document d = new Document();
            d.setFileName("spec.pdf");

            Associations.link(project, d);

            assertThat(d.getProject()).isSameAs(project);
            assertThat(project.getDocuments()).contains(d);
        }

        @Test
        @DisplayName("unlink removes document from project and nullifies its project")
        void unlink_documentRemovedFromProject() {
            Document d = new Document();
            Associations.link(project, d);

            Associations.unlink(project, d);

            assertThat(d.getProject()).isNull();
            assertThat(project.getDocuments()).doesNotContain(d);
        }
    }

    // ── Functionality <-> FunctionalRequirement ───────────────────────────────

    @Nested
    @DisplayName("Functionality <-> FunctionalRequirement")
    class FunctionalityFR {

        @Test
        @DisplayName("link sets functionality on FR and adds it to functionality")
        void link_frBelongsToFunctionality() {
            Functionality f = new Functionality();
            f.setState(FunctionalityState.ACTIVE);
            FunctionalRequirement fr = new FunctionalRequirement();
            fr.setName("User can login");

            Associations.link(f, fr);

            assertThat(fr.getFunctionality()).isSameAs(f);
            assertThat(f.getRequirements()).contains(fr);
        }

        @Test
        @DisplayName("unlink removes FR from functionality and nullifies its functionality")
        void unlink_frRemovedFromFunctionality() {
            Functionality f = new Functionality();
            FunctionalRequirement fr = new FunctionalRequirement();
            Associations.link(f, fr);

            Associations.unlink(f, fr);

            assertThat(fr.getFunctionality()).isNull();
            assertThat(f.getRequirements()).doesNotContain(fr);
        }
    }

    // ── Requirement parent <-> child ──────────────────────────────────────────

    @Nested
    @DisplayName("Requirement parent <-> child")
    class RequirementHierarchy {

        @Test
        @DisplayName("link sets parent on child and adds child to parent's children")
        void link_childBelongsToParent() {
            FunctionalRequirement parent = new FunctionalRequirement();
            parent.setName("Parent FR");
            FunctionalRequirement child = new FunctionalRequirement();
            child.setName("Child FR");

            Associations.link(parent, child);

            assertThat(child.getParent()).isSameAs(parent);
            assertThat(parent.getChildren()).contains(child);
        }

        @Test
        @DisplayName("unlink removes child from parent and nullifies parent reference")
        void unlink_childRemovedFromParent() {
            FunctionalRequirement parent = new FunctionalRequirement();
            FunctionalRequirement child = new FunctionalRequirement();
            Associations.link(parent, child);

            Associations.unlink(parent, child);

            assertThat(child.getParent()).isNull();
            assertThat(parent.getChildren()).doesNotContain(child);
        }

        @Test
        @DisplayName("parent can have multiple children")
        void link_multipleChildren() {
            FunctionalRequirement parent = new FunctionalRequirement();
            FunctionalRequirement child1 = new FunctionalRequirement();
            FunctionalRequirement child2 = new FunctionalRequirement();

            Associations.link(parent, child1);
            Associations.link(parent, child2);

            assertThat(parent.getChildren()).containsExactlyInAnyOrder(child1, child2);
        }
    }
}
