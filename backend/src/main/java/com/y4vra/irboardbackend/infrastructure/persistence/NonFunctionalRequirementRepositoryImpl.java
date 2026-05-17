package com.y4vra.irboardbackend.infrastructure.persistence;

import com.y4vra.irboardbackend.domain.model.Document;
import com.y4vra.irboardbackend.domain.model.FunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.NonFunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.enums.RequirementState;
import com.y4vra.irboardbackend.domain.repositories.NonFunctionalRequirementRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
interface JpaNonFunctionalRequirementRepository extends JpaRepository<NonFunctionalRequirement, Long> {
    @EntityGraph(attributePaths = {"children", "children.children"})
    @Query("SELECT n FROM NonFunctionalRequirement n WHERE n.project.id = :projectId AND n.parent IS NULL")
    List<NonFunctionalRequirement> findAllByProjectId(Long projectId);
    @Query(value = """
        WITH RECURSIVE root_finder AS (
            SELECT id, parent_id, project_id
            FROM requirement
            WHERE id = :id
            UNION ALL
            SELECT r.id, r.parent_id, r.project_id
            FROM requirement r
            INNER JOIN root_finder rf ON r.id = rf.parent_id
        )
        SELECT project_id FROM root_finder WHERE parent_id IS NULL LIMIT 1
        """, nativeQuery = true)
    Optional<Long> findRootProjectIdById(@Param("id") Long id);
    @Query("""
        SELECT nfr FROM NonFunctionalRequirement nfr JOIN nfr.observerRequirements r WHERE r.id = :requirementId
        """)
    List<NonFunctionalRequirement> findAllObservedByRequirement(Long requirementId);
    @Query("""
        SELECT nfr FROM NonFunctionalRequirement nfr
        WHERE nfr.project.id = :projectId
        AND nfr.id <> :requirementId
        AND NOT EXISTS (
            SELECT 1 FROM nfr.observerRequirements r
            WHERE r.id = :requirementId
        )
    """)
    List<NonFunctionalRequirement> findObservableNfRequirementsForRequirement(Long projectId,Long requirementId);

    @Query("select r from NonFunctionalRequirement r left join fetch r.parent where r.id = :nonFunctionalRequirementId")
    Optional<NonFunctionalRequirement> findByIdWithParent(Long nonFunctionalRequirementId);
    @Query("SELECT r FROM NonFunctionalRequirement r LEFT JOIN FETCH r.children WHERE r.id = :nonFunctionalRequirementId")
    Optional<NonFunctionalRequirement> findByIdWithChildren(Long nonFunctionalRequirementId);
    @Query("""
   SELECT COUNT(nfr) = :expectedCount
   FROM NonFunctionalRequirement nfr
   WHERE nfr.project.id = :projectId
   AND nfr.id IN :nonFunctionalRequirementIds
   """)
    boolean existsAllInProject(Long projectId,List<Long> nonFunctionalRequirementIds,long expectedCount);
    @Modifying
    @Query("""
   UPDATE NonFunctionalRequirement nfr
   SET nfr.state = :newState
   WHERE nfr.id IN :nonFunctionalRequirementIds
   AND nfr.project.id = :projectId
   AND nfr.state = :oldState
   """)
    int updateStateByIdsAndProject(List<Long> nonFunctionalRequirementIds, Long projectId, RequirementState newState, RequirementState oldState);
}

@Component
public class NonFunctionalRequirementRepositoryImpl implements NonFunctionalRequirementRepository {

    private final JpaNonFunctionalRequirementRepository jpaRepository;

    public NonFunctionalRequirementRepositoryImpl(JpaNonFunctionalRequirementRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<NonFunctionalRequirement> findAll() {
        return jpaRepository.findAll();
    }

    @Override
    public List<NonFunctionalRequirement> findAllById(Iterable<Long> ids) {
        return jpaRepository.findAllById(ids);
    }

    @Override
    public List<NonFunctionalRequirement> findAllByProjectId(Long projectId) {
        return jpaRepository.findAllByProjectId(projectId);
    }

    @Override
    public Optional<NonFunctionalRequirement> findById(Long id) {
        return jpaRepository.findById(id);
    }

    @Override
    public NonFunctionalRequirement save(NonFunctionalRequirement functionality) {
        return jpaRepository.save(functionality);
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }
    @Override
    public Optional<Long> findRootProjectIdById(Long id){
        return jpaRepository.findRootProjectIdById(id);
    }
    @Override
    public List<NonFunctionalRequirement> findAllObservedByRequirement(Long requirementId){
        return jpaRepository.findAllObservedByRequirement(requirementId);
    }

    @Override
    public List<NonFunctionalRequirement> findObservableNfRequirementsForRequirement(Long projectId,Long requirementId) {
        return jpaRepository.findObservableNfRequirementsForRequirement(projectId,requirementId);
    }

    @Override
    public Optional<NonFunctionalRequirement> findByIdWithParent(Long nonFunctionalRequirementId) {
        return jpaRepository.findByIdWithParent(nonFunctionalRequirementId);
    }
    @Override
    public Optional<NonFunctionalRequirement> findByIdWithChildren(Long nonFunctionalRequirementId) {
        return jpaRepository.findByIdWithChildren(nonFunctionalRequirementId);
    }

    @Override
    public boolean allNonFunctionalRequirementsBelongToProject(Long projectId, List<Long> nonFunctionalRequirementIds) {
        return jpaRepository.existsAllInProject(projectId,nonFunctionalRequirementIds,nonFunctionalRequirementIds.size());
    }

    @Override
    public int updateStateByIdsAndProject(List<Long> nonFunctionalRequirementIds, Long projectId, RequirementState requirementState, RequirementState requirementState1) {
        return jpaRepository.updateStateByIdsAndProject(nonFunctionalRequirementIds, projectId, requirementState, requirementState1);
    }
}