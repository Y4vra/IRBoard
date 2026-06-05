package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.SearchResultDTO;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.repositories.SearchRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SearchServiceTest {

    @Mock
    private SearchRepository searchRepository;

    @Mock
    private PermissionService permissionService;

    @InjectMocks
    private SearchService searchService;

    private final String oryId = "user-ory-123";

    private SearchResultDTO frResult;
    private SearchResultDTO nfrResult;

    @BeforeEach
    void setUp() {
        frResult = new SearchResultDTO(
                100L,
                "Login Requirement",
                "User can login",
                "FR",
                1L,
                10L,
                "1-FR-0001"
        );

        nfrResult = new SearchResultDTO(
                200L,
                "Response Time",
                "Must respond within 200ms",
                "NFR",
                1L,
                null,
                "1-NFR-0001"
        );
    }

    @Test
    void goTo_returnsEmptyWhenSlugIsInvalid() {
        Optional<SearchResultDTO> result = searchService.goTo(oryId, "invalid-slug");

        assertThat(result).isEmpty();

        verifyNoInteractions(searchRepository);
        verifyNoInteractions(permissionService);
    }

    @Test
    void goTo_returnsFRWhenFoundAndAuthorized() {
        String slug = "1-FR-0001";

        when(searchRepository.findFRBySlug(slug))
                .thenReturn(Optional.of(frResult));

        when(permissionService.checkPermission(
                "Functionality",
                "10",
                "viewRequirements",
                oryId))
                .thenReturn(true);

        Optional<SearchResultDTO> result = searchService.goTo(oryId, slug);

        assertThat(result).isPresent();
        assertThat(result.get()).isEqualTo(frResult);

        verify(searchRepository).findFRBySlug(slug);
    }

    @Test
    void goTo_returnsEmptyWhenFRPermissionDenied() {
        String slug = "1-FR-0001";

        when(searchRepository.findFRBySlug(slug))
                .thenReturn(Optional.of(frResult));

        when(permissionService.checkPermission(
                "Functionality",
                "10",
                "viewRequirements",
                oryId))
                .thenReturn(false);

        Optional<SearchResultDTO> result = searchService.goTo(oryId, slug);

        assertThat(result).isEmpty();
    }

    @Test
    void goTo_returnsNFRWhenFoundAndAuthorized() {
        String slug = "1-NFR-0001";

        when(searchRepository.findNFRBySlug(slug))
                .thenReturn(Optional.of(nfrResult));

        when(permissionService.checkPermission(
                "Project",
                "1",
                "view",
                oryId))
                .thenReturn(true);

        Optional<SearchResultDTO> result = searchService.goTo(oryId, slug);

        assertThat(result).isPresent();
        assertThat(result.get()).isEqualTo(nfrResult);
    }

    @Test
    void goTo_returnsEmptyWhenNFRPermissionDenied() {
        String slug = "1-NFR-0001";

        when(searchRepository.findNFRBySlug(slug))
                .thenReturn(Optional.of(nfrResult));

        when(permissionService.checkPermission(
                "Project",
                "1",
                "view",
                oryId))
                .thenReturn(false);

        Optional<SearchResultDTO> result = searchService.goTo(oryId, slug);

        assertThat(result).isEmpty();
    }

    @Test
    void goTo_returnsEmptyWhenRepositoryFindsNothing() {
        String slug = "1-FR-0001";

        when(searchRepository.findFRBySlug(slug))
                .thenReturn(Optional.empty());

        Optional<SearchResultDTO> result = searchService.goTo(oryId, slug);

        assertThat(result).isEmpty();

        verify(searchRepository).findFRBySlug(slug);
        verifyNoInteractions(permissionService);
    }

    @Test
    void goTo_usesProjectPermissionForStakeholder() {
        String slug = "1-STKH-0001";

        SearchResultDTO stakeholderResult = new SearchResultDTO(
                300L,
                "Customer",
                "Main customer stakeholder",
                "STKH",
                5L,
                null,
                slug
        );

        when(searchRepository.findStakeholderBySlug(slug))
                .thenReturn(Optional.of(stakeholderResult));

        when(permissionService.checkPermission(
                "Project",
                "5",
                "view",
                oryId))
                .thenReturn(true);

        Optional<SearchResultDTO> result = searchService.goTo(oryId, slug);

        assertThat(result).contains(stakeholderResult);
    }

    @Test
    void goTo_usesFunctionalityPermissionForFunctionality() {
        String slug = "1-FUNC-0001";

        SearchResultDTO functionalityResult = new SearchResultDTO(
                400L,
                "Authentication",
                "Authentication functionality",
                "FUNC",
                5L,
                20L,
                slug
        );

        when(searchRepository.findFunctionalityBySlug(slug))
                .thenReturn(Optional.of(functionalityResult));

        when(permissionService.checkPermission(
                "Functionality",
                "20",
                "viewRequirements",
                oryId))
                .thenReturn(true);

        Optional<SearchResultDTO> result = searchService.goTo(oryId, slug);

        assertThat(result).contains(functionalityResult);
    }

    @Test
    void goTo_usesProjectPermissionForDocument() {
        String slug = "1-DOC-0001";

        SearchResultDTO documentResult = new SearchResultDTO(
                500L,
                "Requirements Spec",
                "System requirements",
                "DOC",
                5L,
                null,
                slug
        );

        when(searchRepository.findDocumentBySlug(slug))
                .thenReturn(Optional.of(documentResult));

        when(permissionService.checkPermission(
                "Project",
                "5",
                "view",
                oryId))
                .thenReturn(true);

        Optional<SearchResultDTO> result = searchService.goTo(oryId, slug);

        assertThat(result).contains(documentResult);
    }
}