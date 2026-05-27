package com.y4vra.irboardbackend.infrastructure.persistence;

import com.y4vra.irboardbackend.domain.model.Functionality;
import com.y4vra.irboardbackend.domain.model.enums.FunctionalityState;
import com.y4vra.irboardbackend.domain.model.enums.ProjectState;
import com.y4vra.irboardbackend.domain.model.enums.RequirementState;
import com.y4vra.irboardbackend.domain.model.projections.ProjectFunctionalityProjection;
import com.y4vra.irboardbackend.domain.repositories.FunctionalityRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
interface JpaFunctionalityRepository extends JpaRepository<Functionality, Long> {
    List<Functionality> findByProjectId(Long projectId);
    Optional<Functionality> findByIdAndProjectId(Long id, Long projectId);
    @Query("SELECT f.id FROM Functionality f WHERE f.project.id = :projectId")
    Set<Long> findIdsByProjectId(long projectId);
    @Query("""
       SELECT f.project.id as projectId, f.id as funcId
       FROM Functionality f
       WHERE f.id IN :functionalityIds
       """)
    List<ProjectFunctionalityProjection> groupByIdsGroupedByProject(List<Long> functionalityIds);

    @Query("""
        SELECT r.id 
        FROM FunctionalRequirement r
        WHERE r.functionality.id = :functionalityId
        AND r.project.id = :projectId
        AND r.parent = NULL
        AND r.state NOT IN :invalidStates
        """)
    List<Long> getActiveRootRequirementIds(Long projectId, Long functionalityId, List<RequirementState> invalidStates);

    Optional<Functionality> findByIdAndProjectIdAndStateNot(Long functionalityId, Long projectId, FunctionalityState state);
    Optional<Functionality> findByIdAndProjectIdAndState(Long functionalityId, Long projectId, FunctionalityState state);

    int deleteByIdAndProjectIdAndState(Long functionalityId, Long projectId, FunctionalityState functionalityState);

    @Query("""
        SELECT f FROM Functionality f
        WHERE f.project.id = :projectId
        AND f.state = :state
        AND f.project.state = :projectState
        """)
    Optional<Functionality> findByIdAndStateAndProjectIdAndProjectState(Long id, FunctionalityState state, Long projectId, ProjectState projectState);

    @Query("""
        SELECT f FROM Functionality f
        WHERE f.project.id = :projectId
        AND f.state IN :states
        AND f.project.state = :projectState
        """)
    Optional<Functionality> findByIdAndStatesAndProjectIdAndProjectState(Long id, List<FunctionalityState> states, Long projectId, ProjectState projectState);

    Optional<Functionality> findByIdAndState(Long id, FunctionalityState state);

    List<Functionality> findByStateAndProjectId(FunctionalityState functionalityState, Long projectId);
    List<Functionality> findByStateNotAndProjectId(FunctionalityState functionalityState, Long projectId);
}

@Component
public class FunctionalityRepositoryImpl implements FunctionalityRepository {

    private final JpaFunctionalityRepository jpaRepository;

    public FunctionalityRepositoryImpl(JpaFunctionalityRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<Functionality> findByProjectId(Long projectId) {
        return jpaRepository.findByProjectId(projectId);
    }

    @Override
    public Optional<Functionality> findByIdAndProjectId(Long id,Long projectId) {
        return jpaRepository.findByIdAndProjectId(id,projectId);
    }

    @Override
    public Optional<Functionality> findByIdAndStateAndProjectIdAndProjectState(Long id, FunctionalityState state, Long projectId, ProjectState projectState) {
        return jpaRepository.findByIdAndStateAndProjectIdAndProjectState(id,state,projectId,projectState);
    }

    @Override
    public Functionality save(Functionality functionality) {
        return jpaRepository.save(functionality);
    }

    @Override
    public Set<Long> findIdsByProjectId(Long projectId){
        return jpaRepository.findIdsByProjectId(projectId);
    }

    @Override
    public List<ProjectFunctionalityProjection> groupByIdsGroupedByProject(List<Long> functionalityIds){
        return jpaRepository.groupByIdsGroupedByProject(functionalityIds);
    }

    @Override
    public List<Long> getActiveRootRequirementIds(Long projectId, Long functionalityId) {
        return jpaRepository.getActiveRootRequirementIds(projectId,functionalityId,List.of(RequirementState.REMOVED,RequirementState.DEACTIVATED));
    }

    @Override
    public Optional<Functionality> findByIdAndProjectIdAndStateNot(Long functionalityId, Long projectId, FunctionalityState functionalityState) {
        return jpaRepository.findByIdAndProjectIdAndStateNot(functionalityId,projectId,functionalityState);
    }

    @Override
    public Optional<Functionality> findByIdAndProjectIdAndState(Long functionalityId, Long projectId, FunctionalityState functionalityState) {
        return jpaRepository.findByIdAndProjectIdAndState(functionalityId,projectId,functionalityState);
    }

    @Override
    public int deleteFunctionalityAndRequirementsInState(Long projectId, Long functionalityId, FunctionalityState functionalityState) {
        return jpaRepository.deleteByIdAndProjectIdAndState(functionalityId,projectId,functionalityState);
    }

    @Override
    public Optional<Functionality> findByIdAndState(Long functionalityId, FunctionalityState functionalityState) {
        return jpaRepository.findByIdAndState(functionalityId,functionalityState);
    }

    @Override
    public List<Functionality> findByStateAndProjectId(FunctionalityState functionalityState, Long projectId) {
        return jpaRepository.findByStateAndProjectId(functionalityState,projectId);
    }

    @Override
    public List<Functionality> findByStateNotAndProjectId(FunctionalityState functionalityState, Long projectId) {
        return jpaRepository.findByStateNotAndProjectId(functionalityState,projectId);
    }

    @Override
    public Optional<Functionality> findByIdAndStatesAndProjectIdAndProjectState(Long functionalityId, List<FunctionalityState> states, Long projectId, ProjectState projectState) {
        return jpaRepository.findByIdAndStatesAndProjectIdAndProjectState(functionalityId,states,projectId,projectState);
    }

}