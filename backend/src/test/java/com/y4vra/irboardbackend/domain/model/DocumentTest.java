package com.y4vra.irboardbackend.domain.model;


import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

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
}