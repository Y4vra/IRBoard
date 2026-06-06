package com.y4vra.irboardbackend.infrastructure.persistence;

import com.y4vra.irboardbackend.domain.model.Requirement;
import com.y4vra.irboardbackend.domain.model.Stakeholder;
import com.y4vra.irboardbackend.domain.model.enums.EntityState;
import com.y4vra.irboardbackend.domain.repositories.StakeholderRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
interface JpaStakeholderRepository extends JpaRepository<Stakeholder, Long> {
    Optional<Stakeholder> findByIdAndProjectId(Long id,Long projectId);

    List<Stakeholder> findByProjectIdAndStateNot(Long projectId,EntityState state);
    List<Stakeholder> findByProjectIdAndState(Long projectId,EntityState state);

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
    @Query("""
        SELECT s FROM Stakeholder s JOIN s.observerRequirements r WHERE r.id = :requirementId
    """)
    List<Stakeholder> findAllObservedByRequirement(Long requirementId);
    @Query("""
        SELECT s FROM Stakeholder s
        WHERE s.project.id = :projectId
        AND s.state NOT IN :notAllowedStates
        AND NOT EXISTS (
            SELECT 1 FROM s.observerRequirements r
            WHERE r.id = :requirementId
        )
    """)
    List<Stakeholder> findObservableStakeholdersForRequirement(Long projectId,Long requirementId,List<EntityState> notAllowedStates);
    @Query("""
   SELECT COUNT(s) = :expectedCount
   FROM Stakeholder s
   WHERE s.project.id = :projectId
   AND s.id IN :stakeholderIds
   """)
    boolean existsAllInProject(Long projectId,List<Long> stakeholderIds,long expectedCount);
    @Modifying
    @Query("""
   UPDATE Stakeholder s
   SET s.state = :newState
   WHERE s.id IN :stakeholderIds
   AND s.project.id = :projectId
   AND s.state = :oldState
   """)
    int updateStateByIdsAndProject(List<Long> stakeholderIds, Long projectId, EntityState newState, EntityState oldState);
    @Query("""
        SELECT s from Stakeholder s
        WHERE s.id IN :stakeholderIds
        AND s.project.id = :projectId
        AND s.state = :state
        """)
    List<Stakeholder> findAllByIdsAndProjectIdAndState(List<Long> stakeholderIds, Long projectId, EntityState state);
    @Query("""
        SELECT s from Stakeholder s
        WHERE s.id IN :stakeholderIds
        AND s.project.id = :projectId
        AND s.state IN :states
        """)
    List<Stakeholder> findAllByIdsAndProjectIdAndState(List<Long> stakeholderIds, Long projectId, List<EntityState> states);
}

@Component
public class StakeholderRepositoryImpl implements StakeholderRepository {

    private final JpaStakeholderRepository jpaRepository;

    public StakeholderRepositoryImpl(JpaStakeholderRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<Stakeholder> findAllById(Iterable<Long> ids) {
        return jpaRepository.findAllById(ids);
    }
    @Override
    public Optional<Stakeholder> findByIdAndProjectId(Long id,Long projectId) {return jpaRepository.findByIdAndProjectId(id,projectId);}
    @Override
    public Stakeholder save(Stakeholder stakeholder) {
        return jpaRepository.save(stakeholder);
    }

    @Override
    public List<Stakeholder> findAllByProjectIdNotRemoved(Long projectId){
        return jpaRepository.findByProjectIdAndStateNot(projectId,EntityState.REMOVED);
    }
    @Override
    public List<Stakeholder> findAllByProjectIdRemoved(Long projectId){
        return jpaRepository.findByProjectIdAndState(projectId,EntityState.REMOVED);
    }

    @Override
    public List<Requirement> findFilteredRequirementsForStakeholder(Long stakeholderId, Set<Long> functionalityIds) {
        return jpaRepository.findFilteredRequirementsForStakeholder(stakeholderId, functionalityIds);
    }
    @Override
    public List<Stakeholder> findAllObservedByRequirement(Long requirementId) {
        return jpaRepository.findAllObservedByRequirement(requirementId);
    }
    @Override
    public List<Stakeholder> findObservableStakeholdersForRequirement(Long projectId,Long requirementId) {
        return jpaRepository.findObservableStakeholdersForRequirement(projectId,requirementId, List.of(EntityState.REMOVED,EntityState.DEACTIVATED));
    }

    @Override
    public boolean allStakeholdersBelongToProject(Long projectId, List<Long> stakeholderIds) {
        return jpaRepository.existsAllInProject(projectId,stakeholderIds,stakeholderIds.size());
    }

    @Override
    public int updateStateByIdsAndProject(List<Long> stakeholderIds, Long projectId, EntityState newState, EntityState oldState) {
        return jpaRepository.updateStateByIdsAndProject(stakeholderIds, projectId, newState, oldState);
    }

    @Override
    public int deleteRemovedByIdsAndProject(List<Long> stakeholderIds, Long projectId) {
        List<Stakeholder> stakeholders = jpaRepository.findAllByIdsAndProjectIdAndState(stakeholderIds,projectId,EntityState.REMOVED);
        jpaRepository.deleteAll(stakeholders);
        return stakeholders.size();
    }

    @Override
    public List<Stakeholder> findAllByIdsAndProjectIdAndState(List<Long> stakeholderIds, Long projectId, EntityState state) {
        return jpaRepository.findAllByIdsAndProjectIdAndState(stakeholderIds,projectId,state);
    }
    @Override
    public List<Stakeholder> findAllByIdsAndProjectIdAndState(List<Long> stakeholderIds, Long projectId, List<EntityState> states) {
        return jpaRepository.findAllByIdsAndProjectIdAndState(stakeholderIds,projectId,states);
    }

    /*-------------------testing purposes----------------*/
    @Override
    public List<Stakeholder> findAll() {
        return jpaRepository.findAll();
    }
    @Override
    public void deleteAll() {
        jpaRepository.deleteAll();
    }
    @Override
    public void saveAll(List<Stakeholder> stakeholders) {
        jpaRepository.saveAll(stakeholders);
    }
}