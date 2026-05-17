package com.y4vra.irboardbackend.infrastructure.persistence;

import com.y4vra.irboardbackend.application.dtos.SearchResultDTO;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.repositories.SearchRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
interface JpaSearchRepository extends JpaRepository<Project, Long> {
    @Query("""
        SELECT new com.y4vra.irboardbackend.application.dtos.SearchResultDTO(
            fr.id, fr.name, fr.description, 'FR',
            fr.functionality.project.id, fr.functionality.id, fr.entityIdentifier
        )
        FROM FunctionalRequirement fr
        WHERE fr.entityIdentifier = :slug
        AND fr.state <> 'DEACTIVATED'
        """)
    Optional<SearchResultDTO> findFRBySlug(@Param("slug") String slug);

    @Query("""
        SELECT new com.y4vra.irboardbackend.application.dtos.SearchResultDTO(
            nfr.id, nfr.name, nfr.description, 'NFR',
            nfr.project.id, null, nfr.entityIdentifier
        )
        FROM NonFunctionalRequirement nfr
        WHERE nfr.entityIdentifier = :slug
        AND nfr.state <> 'DEACTIVATED'
        """)
    Optional<SearchResultDTO> findNFRBySlug(@Param("slug") String slug);

    @Query("""
        SELECT new com.y4vra.irboardbackend.application.dtos.SearchResultDTO(
            s.id, s.name, s.description, 'STAKEHOLDER',
            s.project.id, null, s.entityIdentifier
        )
        FROM Stakeholder s
        WHERE s.entityIdentifier = :slug
        AND s.state <> 'DEACTIVATED'
        """)
    Optional<SearchResultDTO> findStakeholderBySlug(@Param("slug") String slug);

    @Query("""
        SELECT new com.y4vra.irboardbackend.application.dtos.SearchResultDTO(
            f.id, f.name, f.description, 'FUNCTIONALITY',
            f.project.id, f.id, f.entityIdentifier
        )
        FROM Functionality f
        WHERE f.entityIdentifier = :slug
        """)
    Optional<SearchResultDTO> findFunctionalityBySlug(@Param("slug") String slug);

    @Query("""
        SELECT new com.y4vra.irboardbackend.application.dtos.SearchResultDTO(
            d.id, d.fileName, '', 'DOCUMENT',
            d.project.id, null, d.entityIdentifier
        )
        FROM Document d
        WHERE d.entityIdentifier = :slug
        """)
    Optional<SearchResultDTO> findDocumentBySlug(@Param("slug") String slug);
}

@Component
public class SearchRepositoryImpl implements SearchRepository {

    private JpaSearchRepository jpaSearchRepository;

    public SearchRepositoryImpl(JpaSearchRepository jpaSearchRepository) {
        this.jpaSearchRepository = jpaSearchRepository;
    }


    @Override
    public Optional<SearchResultDTO> findFRBySlug(String slug) {
        return jpaSearchRepository.findFRBySlug(slug);
    }

    @Override
    public Optional<SearchResultDTO> findNFRBySlug(String slug) {
        return jpaSearchRepository.findNFRBySlug(slug);
    }

    @Override
    public Optional<SearchResultDTO> findStakeholderBySlug(String slug) {
        return jpaSearchRepository.findStakeholderBySlug(slug);
    }

    @Override
    public Optional<SearchResultDTO> findFunctionalityBySlug(String slug) {
        return jpaSearchRepository.findFunctionalityBySlug(slug);
    }

    @Override
    public Optional<SearchResultDTO> findDocumentBySlug(String slug) {
        return jpaSearchRepository.findDocumentBySlug(slug);
    }
}
