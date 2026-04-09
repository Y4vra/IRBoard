package com.y4vra.irboardbackend.domain.service;

import com.y4vra.irboardbackend.domain.model.Associations;
import com.y4vra.irboardbackend.domain.model.FunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.Functionality;
import com.y4vra.irboardbackend.domain.model.NonFunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.Project;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

@DisplayName("RequirementIdentificationGenerator")
class RequirementIdentificationGeneratorTest {

    private RequirementIdentificationGenerator generator;
    private Project project;

    @BeforeEach
    void setUp() {
        generator = new RequirementIdentificationGenerator();
        project = new Project("IRBoard", "desc", "TERNARY");
    }

    // ── NFR slug ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("generateSlugForRequirement(NonFunctionalRequirement)")
    class NfrSlug {

        @Test
        @DisplayName("slug contains the NFR marker")
        void slug_containsNFRMarker() {
            NonFunctionalRequirement nfr = new NonFunctionalRequirement();
            Associations.link(project, nfr);

            String slug = generator.generateSlugForRequirement(nfr);

            assertThat(slug).contains("-NFR-");
        }

        @Test
        @DisplayName("slug contains a date-time segment matching yyyyMMdd-HHmm")
        void slug_containsDateTimeSegment() {
            NonFunctionalRequirement nfr = new NonFunctionalRequirement();
            Associations.link(project, nfr);

            String slug = generator.generateSlugForRequirement(nfr);

            // Date segment: 8 digits, a dash, then 4 digits
            assertThat(slug).matches(".*\\d{8}-\\d{4}$");
        }

        @Test
        @DisplayName("slug is not blank")
        void slug_notBlank() {
            NonFunctionalRequirement nfr = new NonFunctionalRequirement();
            Associations.link(project, nfr);

            String slug = generator.generateSlugForRequirement(nfr);

            assertThat(slug).isNotBlank();
        }

        @Test
        @DisplayName("two consecutive calls produce slugs with the same NFR marker")
        void slug_nfrMarkerConsistent() {
            NonFunctionalRequirement nfr = new NonFunctionalRequirement();
            Associations.link(project, nfr);

            String slug1 = generator.generateSlugForRequirement(nfr);
            String slug2 = generator.generateSlugForRequirement(nfr);

            assertThat(slug1).contains("-NFR-");
            assertThat(slug2).contains("-NFR-");
        }
    }

    // ── FR slug ───────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("generateSlugForRequirement(FunctionalRequirement)")
    class FrSlug {

        private Functionality functionality;

        @BeforeEach
        void setUpFunctionality() {
            functionality = new Functionality();
            functionality.setName("Authentication");
            Associations.link(project, functionality);
        }

        @Test
        @DisplayName("slug contains the FR marker")
        void slug_containsFRMarker() {
            FunctionalRequirement fr = new FunctionalRequirement();
            Associations.link(functionality, fr);

            String slug = generator.generateSlugForRequirement(fr);

            assertThat(slug).contains("-FR-");
        }

        @Test
        @DisplayName("slug contains a date-time segment matching yyyyMMdd-HHmm")
        void slug_containsDateTimeSegment() {
            FunctionalRequirement fr = new FunctionalRequirement();
            Associations.link(functionality, fr);

            String slug = generator.generateSlugForRequirement(fr);

            assertThat(slug).matches(".*\\d{8}-\\d{4}$");
        }

        @Test
        @DisplayName("slug is not blank")
        void slug_notBlank() {
            FunctionalRequirement fr = new FunctionalRequirement();
            Associations.link(functionality, fr);

            String slug = generator.generateSlugForRequirement(fr);

            assertThat(slug).isNotBlank();
        }

        @Test
        @DisplayName("throws NullPointerException when FR has no functionality (contract violation)")
        void slug_frWithoutFunctionality_throwsNPE() {
            FunctionalRequirement fr = new FunctionalRequirement();
            // deliberately NOT linking to any functionality

            assertThatThrownBy(() -> generator.generateSlugForRequirement(fr))
                    .isInstanceOf(NullPointerException.class);
        }
    }
}
