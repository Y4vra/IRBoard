package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.DocumentDTO;
import com.y4vra.irboardbackend.domain.model.Document;
import com.y4vra.irboardbackend.domain.model.Project;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class DocumentMapperTest {

    private DocumentMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new DocumentMapper();
    }

    @Test
    void toDto_returnsNullWhenEntityIsNull() {
        assertThat(mapper.toDto(null)).isNull();
    }

    @Test
    void toDto_mapsAllFieldsIncludingAccessUrl() {
        Project project = new Project();
        project.setId(3L);

        Document document = new Document();
        document.setId(1L);
        document.setFileName("spec.pdf");
        document.setMimeType("application/pdf");
        document.setFileSize(1024L);
        document.setProject(project);

        DocumentDTO dto = mapper.toDtoDetailed(document, "https://minio/spec.pdf");

        assertThat(dto.id()).isEqualTo(1L);
        assertThat(dto.fileName()).isEqualTo("spec.pdf");
        assertThat(dto.mimeType()).isEqualTo("application/pdf");
        assertThat(dto.fileSize()).isEqualTo(1024L);
        assertThat(dto.projectId()).isEqualTo(3L);
        assertThat(dto.accessUrl()).isEqualTo("https://minio/spec.pdf");
    }

    @Test
    void toDto_handlesNullProject() {
        Document document = new Document();
        document.setId(2L);
        document.setFileName("file.pdf");
        document.setMimeType("application/pdf");
        document.setFileSize(512L);
        document.setProject(null);

        DocumentDTO dto = mapper.toDto(document);

        assertThat(dto.projectId()).isNull();
    }

    @Test
    void toEntity_returnsNullWhenDtoIsNull() {
        assertThat(mapper.toEntity(null)).isNull();
    }

    @Test
    void toEntity_mapsAllFields() {
        DocumentDTO dto = new DocumentDTO(7L, "report.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 2048L, 3L, "url");

        Document entity = mapper.toEntity(dto);

        assertThat(entity.getId()).isEqualTo(7L);
        assertThat(entity.getFileName()).isEqualTo("report.docx");
        assertThat(entity.getMimeType()).isEqualTo("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        assertThat(entity.getFileSize()).isEqualTo(2048L);
    }
}
