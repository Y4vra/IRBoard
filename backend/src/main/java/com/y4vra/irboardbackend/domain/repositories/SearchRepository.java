package com.y4vra.irboardbackend.domain.repositories;

import com.y4vra.irboardbackend.application.dtos.SearchResultDTO;

import java.util.Optional;

public interface SearchRepository {
    Optional<SearchResultDTO> findFRBySlug(String slug);
    Optional<SearchResultDTO> findNFRBySlug(String slug);
    Optional<SearchResultDTO> findStakeholderBySlug(String slug);
    Optional<SearchResultDTO> findFunctionalityBySlug(String slug);
    Optional<SearchResultDTO> findDocumentBySlug(String slug);
}
