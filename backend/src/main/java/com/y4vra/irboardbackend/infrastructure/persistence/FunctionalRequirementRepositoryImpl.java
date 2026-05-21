package com.y4vra.irboardbackend.infrastructure.persistence;

import com.y4vra.irboardbackend.domain.model.FunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.NonFunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.enums.RequirementState;
import com.y4vra.irboardbackend.domain.repositories.FunctionalRequirementRepository;
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
interface JpaFunctionalRequirementRepository extends JpaRepository<FunctionalRequirement, Long> {
    Optional<FunctionalRequirement> findByIdAndFunctionalityIdAndProjectId(Long id, Long functionalityId, Long projectId);
    @Query("""
        SELECT n FROM FunctionalRequirement n 
        WHERE n.functionality.id = :functionalityId 
        AND n.project.id = :projectId
        AND n.parent IS NULL
        AND n.state = :state
        """)
    List<FunctionalRequirement> findAllByFunctionalityIdAndProjectIdAndState(Long functionalityId,Long projectId, RequirementState state);
    @Query("""
        SELECT n FROM FunctionalRequirement n 
        WHERE n.functionality.id = :functionalityId 
        AND n.project.id = :projectId
        AND n.parent IS NULL
        AND n.state <> :state
        """)
    List<FunctionalRequirement> findAllByFunctionalityIdAndProjectIdAndStateNot(Long functionalityId,Long projectId, RequirementState state);
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
    @Query(value = """
        WITH RECURSIVE subtree AS (
            SELECT id FROM requirement WHERE parent_id = :rootId
            UNION ALL
            SELECT r.id FROM requirement r
            INNER JOIN subtree s ON r.parent_id = s.id
        )
        SELECT * FROM requirement
        WHERE requirement_type = 'FR'
        AND id IN (SELECT id FROM subtree)
        """, nativeQuery = true)
    List<FunctionalRequirement> findAllDescendantsOf(Long rootId);
    @Query("""
        SELECT r FROM FunctionalRequirement r JOIN r.observerRequirements r2 WHERE r2.id = :requirementId
    """)
    List<FunctionalRequirement> findAllObservedByRequirement(Long requirementId);
    @Query("""
        SELECT fr FROM FunctionalRequirement fr
        WHERE fr.functionality.project.id = :projectId
        AND fr.functionality.id = :functionalityId
        AND fr.id <> :requirementId
        AND fr.state NOT IN :notAllowedStates
        AND NOT EXISTS (
            SELECT 1 FROM fr.observerRequirements r
            WHERE r.id = :requirementId
        )
        """)
    List<FunctionalRequirement> findObservableFRequirementsForRequirementAndFunctionality(Long projectId,Long functionalityId,Long requirementId,List<RequirementState> notAllowedStates);
    @Query("select f from FunctionalRequirement f left join fetch f.parent where f.id = :id AND f.functionality.id = :functionalityId AND f.project.id = :projectId")
    Optional<FunctionalRequirement> findByIdWithParent(Long id,Long functionalityId,Long projectId);
    @Query("SELECT r FROM FunctionalRequirement r LEFT JOIN FETCH r.children WHERE r.id = :id AND r.functionality.id = :functionalityId AND r.project.id = :projectId")
    Optional<FunctionalRequirement> findByIdWithChildren(Long id,Long functionalityId,Long projectId);
    @Query("""
   SELECT COUNT(fr) = :expectedCount
   FROM FunctionalRequirement fr
   WHERE fr.functionality.id = :functionalityId
   AND fr.project.id = :projectId
   AND fr.id IN :functionalRequirementIds
   """)
    boolean existsAllInFunctionalityAndProject(Long functionalityId,Long projectId,List<Long> functionalRequirementIds,long expectedCount);
    @Modifying
    @Query("""
       UPDATE FunctionalRequirement fr
       SET fr.state = :newState
       WHERE fr.id IN :functionalRequirementIds
       AND fr.functionality.id = :functionalityId
       AND fr.project.id = :projectId
       AND fr.state = :oldState
       """)
    int updateStateByIdsAndFunctionalityAndProject(List<Long> functionalRequirementIds,Long functionalityId,Long projectId,RequirementState newState,RequirementState oldState);
    @Query("""
        SELECT n from FunctionalRequirement n
        WHERE n.id IN :functionalRequirementIds
        AND n.functionality.id = :functionalityId
        AND n.project.id = :projectId
        AND n.state = :state
        """)
    List<FunctionalRequirement> findAllByIdsAndFunctionalityIdAndProjectIdAndState(List<Long> functionalRequirementIds,Long functionalityId, Long projectId, RequirementState state);
    @Query("""
        SELECT n from FunctionalRequirement n
        WHERE n.id IN :functionalRequirementIds
        AND n.functionality.id = :functionalityId
        AND n.project.id = :projectId
        AND n.state IN :states
        """)
    List<FunctionalRequirement> findAllByIdsAndFunctionalityIdAndProjectIdAndState(List<Long> functionalRequirementIds,Long functionalityId, Long projectId, List<RequirementState> states);
}

@Component
public class FunctionalRequirementRepositoryImpl implements FunctionalRequirementRepository {

    private final JpaFunctionalRequirementRepository jpaRepository;

    public FunctionalRequirementRepositoryImpl(JpaFunctionalRequirementRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<FunctionalRequirement> findAllDescendantsOf(Long parentId) {
        return jpaRepository.findAllDescendantsOf(parentId);
    }

    @Override
    public Optional<FunctionalRequirement> findByIdAndFunctionalityIdAndProjectId(Long id,Long functionalityId,Long projectId) {
        return jpaRepository.findByIdAndFunctionalityIdAndProjectId(id,functionalityId,projectId);
    }

    @Override
    public FunctionalRequirement save(FunctionalRequirement functionality) {
        return jpaRepository.save(functionality);
    }

    @Override
    public List<FunctionalRequirement> findAllByFunctionalityIdAndProjectIdNotRemoved(Long functionalityId,Long projectId) {
        return jpaRepository.findAllByFunctionalityIdAndProjectIdAndStateNot(functionalityId,projectId,RequirementState.REMOVED);
    }
    @Override
    public List<FunctionalRequirement> findAllByFunctionalityIdAndProjectIdRemoved(Long functionalityId,Long projectId) {
        return jpaRepository.findAllByFunctionalityIdAndProjectIdAndState(functionalityId,projectId,RequirementState.REMOVED);
    }

    @Override
    public List<FunctionalRequirement> findAllObservedByRequirement(Long requirementId) {
        return jpaRepository.findAllObservedByRequirement(requirementId);
    }

    @Override
    public List<FunctionalRequirement> findObservableFRequirementsForRequirementAndFunctionality(Long projectId,Long functionalityId,Long requirementId) {
        return jpaRepository.findObservableFRequirementsForRequirementAndFunctionality(projectId,functionalityId,requirementId,List.of(RequirementState.REMOVED,RequirementState.DEACTIVATED));
    }

    @Override
    public Optional<FunctionalRequirement> findByIdWithParentAndFunctionalityIdAndProjectId(Long functionalRequirementId,Long functionalityId,Long projectId) {
        return jpaRepository.findByIdWithParent(functionalRequirementId, functionalityId, projectId);
    }

    @Override
    public Optional<FunctionalRequirement> findByIdWithChildrenAndFunctionalityIdAndProjectId(Long functionalRequirementId,Long functionalityId,Long projectId) {
        return jpaRepository.findByIdWithChildren(functionalRequirementId, functionalityId, projectId);
    }
    @Override
    public boolean allFunctionalRequirementsBelongToFunctionalityAndProject(
            Long projectId,
            Long functionalityId,
            List<Long> functionalRequirementIds) {
        return jpaRepository.existsAllInFunctionalityAndProject(
                functionalityId,
                projectId,
                functionalRequirementIds,
                functionalRequirementIds.size()
        );
    }
    @Override
    public int updateStateByIdsAndFunctionalityAndProject(List<Long> functionalRequirementIds, Long functionalityId, Long projectId, RequirementState newState, RequirementState oldState) {
        return jpaRepository.updateStateByIdsAndFunctionalityAndProject(
                functionalRequirementIds,
                functionalityId,
                projectId,
                newState,
                oldState
        );
    }

    @Override
    public int deleteRemovedByIdsAndFunctionalityIdAndProjectId(List<Long> functionalRequirementIds, Long functionalityId, Long projectId) {
        List<FunctionalRequirement> functionalRequirements = jpaRepository.findAllByIdsAndFunctionalityIdAndProjectIdAndState(functionalRequirementIds,functionalityId,projectId,RequirementState.REMOVED);
        jpaRepository.deleteAll(functionalRequirements);
        return functionalRequirements.size();
    }

    @Override
    public List<FunctionalRequirement> findAllByIdsAndFunctionalityIdAndProjectIdAndState(List<Long> functionalRequirementIds, Long functionalityId, Long projectId, RequirementState state) {
        return jpaRepository.findAllByIdsAndFunctionalityIdAndProjectIdAndState(functionalRequirementIds,functionalityId,projectId,state);
    }

    @Override
    public List<FunctionalRequirement> findAllByIdsAndFunctionalityIdAndProjectIdAndState(List<Long> functionalRequirementIds, Long functionalityId, Long projectId, List<RequirementState> states) {
        return jpaRepository.findAllByIdsAndFunctionalityIdAndProjectIdAndState(functionalRequirementIds,functionalityId,projectId,states);
    }
}