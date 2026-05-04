package com.y4vra.irboardbackend.infrastructure.persistence;

import com.y4vra.irboardbackend.domain.model.Document;
import com.y4vra.irboardbackend.domain.model.FunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.Stakeholder;
import com.y4vra.irboardbackend.domain.repositories.FunctionalRequirementRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
interface JpaFunctionalRequirementRepository extends JpaRepository<FunctionalRequirement, Long> {
    @EntityGraph(attributePaths = {"children", "children.children"})
    @Query("SELECT n FROM FunctionalRequirement n WHERE n.functionality.id = :functionalityId AND n.parent IS NULL")
    List<FunctionalRequirement> findAllByFunctionalityId(@Param("functionalityId") Long functionalityId);

    @Query(value = """
        WITH RECURSIVE root_finder AS (
            SELECT id, parent_id, functionality_id
            FROM requirement
            WHERE id = :id
            UNION ALL
            SELECT r.id, r.parent_id, r.functionality_id
            FROM requirement r
            INNER JOIN root_finder rf ON r.id = rf.parent_id
        )
        SELECT functionality_id FROM root_finder WHERE parent_id IS NULL LIMIT 1
        """, nativeQuery = true)
    Optional<Long> findRootFunctionalityIdById(@Param("id") Long id);
    @Query("""
        SELECT r FROM Requirement r JOIN r.observerRequirements r2 WHERE r2.id = :requirementId
    """)
    List<FunctionalRequirement> findAllObservedByRequirement(Long requirementId);
    @Query("""
        SELECT fr FROM FunctionalRequirement fr
        WHERE fr.functionality.project.id = :projectId
        AND fr.functionality.id = :functionalityId
        AND NOT EXISTS (
            SELECT 1 FROM fr.observerRequirements r
            WHERE r.id = :requirementId
        )
    """)
    List<FunctionalRequirement> findObservableFRequirementsForRequirementAndFunctionality(
            Long projectId,
            Long functionalityId,
            Long requirementId
    );
}

@Component
public class FunctionalRequirementRepositoryImpl implements FunctionalRequirementRepository {

    private final JpaFunctionalRequirementRepository jpaRepository;

    public FunctionalRequirementRepositoryImpl(JpaFunctionalRequirementRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<FunctionalRequirement> findAll() {
        return jpaRepository.findAll();
    }

    @Override
    public List<FunctionalRequirement> findAllById(Iterable<Long> ids) {
        return jpaRepository.findAllById(ids);
    }

    @Override
    public Optional<FunctionalRequirement> findById(Long id) {
        return jpaRepository.findById(id);
    }

    @Override
    public FunctionalRequirement save(FunctionalRequirement functionality) {
        return jpaRepository.save(functionality);
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public List<FunctionalRequirement> findAllByFunctionalityId(Long functionalityId) {
        return jpaRepository.findAllByFunctionalityId(functionalityId);
    }
    @Override
    public Optional<Long> findRootFunctionalityIdById(Long id) {
        return jpaRepository.findRootFunctionalityIdById(id);
    }

    @Override
    public List<FunctionalRequirement> findAllObservedByRequirement(Long requirementId) {
        return jpaRepository.findAllObservedByRequirement(requirementId);
    }

    @Override
    public List<FunctionalRequirement> findObservableFRequirementsForRequirementAndFunctionality(
            Long projectId,
            Long functionalityId,
            Long requirementId
    ) {
        return jpaRepository.findObservableFRequirementsForRequirementAndFunctionality(projectId,functionalityId,requirementId);
    }
}