package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.EntitySlug;
import com.y4vra.irboardbackend.application.dtos.SearchResultDTO;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.model.enums.EntitySlugType;
import com.y4vra.irboardbackend.domain.repositories.SearchRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class SearchService {

    private final SearchRepository searchRepository;
    private final PermissionService permissionService;

    public SearchService(SearchRepository searchRepository, PermissionService permissionService) {
        this.searchRepository = searchRepository;
        this.permissionService = permissionService;
    }

    public Optional<SearchResultDTO> goTo(String oryId, String rawSlug) {
        // 1. Parse — must be a full valid slug or we return empty immediately
        EntitySlug slug = EntitySlug.parse(rawSlug).orElse(null);
        if (slug == null) return Optional.empty();

        // 2. Resolve entity by exact slug match
        Optional<SearchResultDTO> result = switch (slug.type()) {
            case EntitySlugType.FR   -> searchRepository.findFRBySlug(slug.fullSlug());
            case EntitySlugType.NFR  -> searchRepository.findNFRBySlug(slug.fullSlug());
            case EntitySlugType.STKH -> searchRepository.findStakeholderBySlug(slug.fullSlug());
            case EntitySlugType.FUNC -> searchRepository.findFunctionalityBySlug(slug.fullSlug());
            case EntitySlugType.DOC  -> searchRepository.findDocumentBySlug(slug.fullSlug());
            default     -> Optional.empty();
        };

        // 3. Check permission on the resolved entity
        return result.filter(r -> hasPermission(oryId, r));
    }

    private boolean hasPermission(String oryId, SearchResultDTO r) {
        return switch (r.type()) {
            case "FR", "FUNC" -> permissionService.checkPermission(
                    "Functionality",
                    String.valueOf(r.functionalityId()),
                    "viewRequirements",
                    oryId
            );
            default -> permissionService.checkPermission(
                    "Project",
                    String.valueOf(r.projectId()),
                    "view",
                    oryId
            );
        };
    }
}