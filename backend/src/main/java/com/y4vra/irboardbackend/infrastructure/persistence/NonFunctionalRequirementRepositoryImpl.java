package com.y4vra.irboardbackend.infrastructure.persistence;

import com.y4vra.irboardbackend.domain.model.NonFunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.enums.RequirementState;
import com.y4vra.irboardbackend.domain.repositories.NonFunctionalRequirementRepository;
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
    Optional<NonFunctionalRequirement> findByIdAndProjectId(Long id, Long projectId);
    @Query("""
        SELECT n FROM NonFunctionalRequirement n 
        WHERE n.project.id = :projectId 
        AND n.parent IS NULL 
        AND n.state = :state
        """)
    List<NonFunctionalRequirement> findAllByProjectIdAndState(Long projectId, RequirementState state);
    @Query("""
        SELECT n FROM NonFunctionalRequirement n 
        WHERE n.project.id = :projectId 
        AND n.parent IS NULL 
        AND n.state <> :state
        """)
    List<NonFunctionalRequirement> findAllByProjectIdAndStateNot(Long projectId, RequirementState state);
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
    @Query(value = """
        WITH RECURSIVE subtree AS (
            SELECT id FROM requirement WHERE parent_id = :rootId
            UNION ALL
            SELECT r.id FROM requirement r
            INNER JOIN subtree s ON r.parent_id = s.id
        )
        SELECT * FROM requirement
        WHERE requirement_type = 'NFR'
        AND id IN (SELECT id FROM subtree)
        """, nativeQuery = true)
    List<NonFunctionalRequirement> findAllDescendantsOf(@Param("rootId") Long rootId);
    @Query("""
        SELECT nfr FROM NonFunctionalRequirement nfr JOIN nfr.observerRequirements r WHERE r.id = :requirementId
        """)
    List<NonFunctionalRequirement> findAllObservedByRequirement(Long requirementId);
    @Query("""
        SELECT nfr FROM NonFunctionalRequirement nfr
        WHERE nfr.project.id = :projectId
        AND nfr.id <> :requirementId
        AND nfr.state NOT IN :notAllowedStates
        AND NOT EXISTS (
            SELECT 1 FROM nfr.observerRequirements r
            WHERE r.id = :requirementId
        )
    """)
    List<NonFunctionalRequirement> findObservableNfRequirementsForRequirement(Long projectId,Long requirementId,List<RequirementState> notAllowedStates);
    @Query("select r from NonFunctionalRequirement r left join fetch r.parent where r.id = :nonFunctionalRequirementId and r.project.id = :projectId")
    Optional<NonFunctionalRequirement> findByIdWithParent(Long nonFunctionalRequirementId,Long projectId);
    @Query("SELECT r FROM NonFunctionalRequirement r LEFT JOIN FETCH r.children WHERE r.id = :nonFunctionalRequirementId and r.project.id = :projectId")
    Optional<NonFunctionalRequirement> findByIdWithChildren(Long nonFunctionalRequirementId,Long projectId);
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
    @Query("""
        SELECT n from NonFunctionalRequirement n
        WHERE n.id IN :nonFunctionalRequirementIds
        AND n.project.id = :projectId
        AND n.state = :state
        """)
    List<NonFunctionalRequirement> findAllByIdsAndProjectIdAndState(List<Long> nonFunctionalRequirementIds, Long projectId, RequirementState state);
    @Query("""
        SELECT n from NonFunctionalRequirement n
        WHERE n.id IN :nonFunctionalRequirementIds
        AND n.project.id = :projectId
        AND n.state IN :states
        """)
    List<NonFunctionalRequirement> findAllByIdsAndProjectIdAndState(List<Long> nonFunctionalRequirementIds, Long projectId, List<RequirementState> states);
}

@Component
public class NonFunctionalRequirementRepositoryImpl implements NonFunctionalRequirementRepository {

    private final JpaNonFunctionalRequirementRepository jpaRepository;

    public NonFunctionalRequirementRepositoryImpl(JpaNonFunctionalRequirementRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<NonFunctionalRequirement> findAllDescendantsOf(Long rootId){
        return jpaRepository.findAllDescendantsOf(rootId);
    }
    @Override
    public List<NonFunctionalRequirement> findAllByProjectIdNotRemoved(Long projectId) {
        return jpaRepository.findAllByProjectIdAndStateNot(projectId,RequirementState.REMOVED);
    }
    @Override
    public List<NonFunctionalRequirement> findAllByProjectIdRemoved(Long projectId) {
        return jpaRepository.findAllByProjectIdAndState(projectId,RequirementState.REMOVED);
    }

    @Override
    public Optional<NonFunctionalRequirement> findByIdAndProjectId(Long id,Long projectId) {
        return jpaRepository.findByIdAndProjectId(id,projectId);
    }

    @Override
    public NonFunctionalRequirement save(NonFunctionalRequirement functionality) {
        return jpaRepository.save(functionality);
    }

    @Override
    public List<NonFunctionalRequirement> findAllObservedByRequirement(Long requirementId){
        return jpaRepository.findAllObservedByRequirement(requirementId);
    }

    @Override
    public List<NonFunctionalRequirement> findObservableNfRequirementsForRequirement(Long projectId,Long requirementId) {
        return jpaRepository.findObservableNfRequirementsForRequirement(projectId,requirementId, List.of(RequirementState.REMOVED,RequirementState.DEACTIVATED));
    }

    @Override
    public Optional<NonFunctionalRequirement> findByIdWithParentAndProjectId(Long nonFunctionalRequirementId,Long projectId) {
        return jpaRepository.findByIdWithParent(nonFunctionalRequirementId,projectId);
    }
    public Optional<NonFunctionalRequirement> findByIdWithChildrenAndProjectId(Long nonFunctionalRequirementId, Long projectId) {
        return jpaRepository.findByIdWithChildren(nonFunctionalRequirementId,projectId);
    }

    @Override
    public boolean allNonFunctionalRequirementsBelongToProject(Long projectId, List<Long> nonFunctionalRequirementIds) {
        return jpaRepository.existsAllInProject(projectId,nonFunctionalRequirementIds,nonFunctionalRequirementIds.size());
    }

    @Override
    public int updateStateByIdsAndProject(List<Long> nonFunctionalRequirementIds, Long projectId, RequirementState requirementState, RequirementState requirementState1) {
        return jpaRepository.updateStateByIdsAndProject(nonFunctionalRequirementIds, projectId, requirementState, requirementState1);
    }

    @Override
    public int deleteRemovedByIdsAndProjectId(List<Long> nonFunctionalRequirementIds, Long projectId) {
        List<NonFunctionalRequirement> nonFunctionalRequirements = jpaRepository.findAllByIdsAndProjectIdAndState(nonFunctionalRequirementIds,projectId,RequirementState.REMOVED);
        jpaRepository.deleteAll(nonFunctionalRequirements);
        return nonFunctionalRequirements.size();
    }

    @Override
    public List<NonFunctionalRequirement> findAllByIdsAndProjectIdAndState(List<Long> nonFunctionalRequirementIds, Long projectId, RequirementState state) {
        return jpaRepository.findAllByIdsAndProjectIdAndState(nonFunctionalRequirementIds,projectId,state);
    }
    @Override
    public List<NonFunctionalRequirement> findAllByIdsAndProjectIdAndState(List<Long> nonFunctionalRequirementIds, Long projectId, List<RequirementState> states) {
        return jpaRepository.findAllByIdsAndProjectIdAndState(nonFunctionalRequirementIds,projectId,states);
    }
}