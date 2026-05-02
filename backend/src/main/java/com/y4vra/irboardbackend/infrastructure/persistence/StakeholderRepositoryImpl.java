package com.y4vra.irboardbackend.infrastructure.persistence;

import com.y4vra.irboardbackend.domain.model.Requirement;
import com.y4vra.irboardbackend.domain.model.Stakeholder;
import com.y4vra.irboardbackend.domain.repositories.StakeholderRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
interface JpaStakeholderRepository extends JpaRepository<Stakeholder, Long> {
    List<Stakeholder> findByProjectId(Long projectId);
    @Query("""
        SELECT r FROM Requirement r
        LEFT JOIN FETCH TREAT(r AS FunctionalRequirement).functionality
        WHERE r IN (
            SELECT r2 FROM Stakeholder s JOIN s.observerRequirements r2 WHERE s.id = :stakeholderId
        )
        AND (
            TYPE(r) = NonFunctionalRequirement
            OR (TYPE(r) = FunctionalRequirement 
                AND TREAT(r AS FunctionalRequirement).functionality.id IN :functionalityIds)
        )
    """)
    List<Requirement> findFilteredRequirementsForStakeholder(
            @Param("stakeholderId") Long stakeholderId,
            @Param("functionalityIds") Set<Long> functionalityIds
    );
}

@Component
public class StakeholderRepositoryImpl implements StakeholderRepository {

    private final JpaStakeholderRepository jpaRepository;

    public StakeholderRepositoryImpl(JpaStakeholderRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<Stakeholder> findAll() {
        return jpaRepository.findAll();
    }

    @Override
    public List<Stakeholder> findAllById(Iterable<Long> ids) {
        return jpaRepository.findAllById(ids);
    }

    @Override
    public Optional<Stakeholder> findById(Long id) {
        return jpaRepository.findById(id);
    }

    @Override
    public List<Stakeholder> findByProjectId(Long projectId) {
        return jpaRepository.findByProjectId(projectId);
    }

    @Override
    public Stakeholder save(Stakeholder stakeholder) {
        return jpaRepository.save(stakeholder);
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }
    @Override
    public List<Requirement> findFilteredRequirementsForStakeholder(Long stakeholderId, Set<Long> functionalityIds) {
        return jpaRepository.findFilteredRequirementsForStakeholder(stakeholderId, functionalityIds);
    }
}