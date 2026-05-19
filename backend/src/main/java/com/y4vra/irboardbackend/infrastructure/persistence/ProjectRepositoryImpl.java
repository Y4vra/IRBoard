package com.y4vra.irboardbackend.infrastructure.persistence;

import com.y4vra.irboardbackend.domain.model.enums.EntityState;
import com.y4vra.irboardbackend.domain.model.enums.RequirementState;
import com.y4vra.irboardbackend.domain.repositories.ProjectRepository;
import com.y4vra.irboardbackend.domain.model.Project;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
interface JpaProjectRepository extends JpaRepository<Project, Long> {
    @Modifying
    @Query("""
        UPDATE Stakeholder s
        SET s.state = :newState
        WHERE s.project.id = :projectId
        AND s.state = :oldState
        """)
    void changeStateAllStakeholders(Long projectId, EntityState newState, EntityState oldState);

    @Modifying
    @Query("""
        UPDATE Document d
        SET d.state = :newState
        WHERE d.project.id = :projectId
        AND d.state = :oldState
        """)
    void changeStateAllDocuments(Long projectId, EntityState newState, EntityState oldState);

    @Modifying
    @Query("""
        UPDATE NonFunctionalRequirement r
        SET r.state = :newState
        WHERE r.project.id = :projectId
        AND r.state = :oldState
        """)
    void changeStateAllNonFunctionalRequirements(Long projectId, RequirementState newState, RequirementState oldState);

    @Modifying
    @Query("""
        UPDATE FunctionalRequirement r
        SET r.state = :newState
        WHERE r.project.id = :projectId
        AND r.state = :oldState
        """)
    void changeStateAllFunctionalRequirements(Long projectId, RequirementState newState, RequirementState oldState);

    @Query("SELECT p.id FROM Project p")
    List<Long> findAllIds();
}

@Component
public class ProjectRepositoryImpl implements ProjectRepository {

    private final JpaProjectRepository jpaRepository;

    public ProjectRepositoryImpl(JpaProjectRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<Project> findAll() {
        return jpaRepository.findAll();
    }

    @Override
    public List<Project> findAllById(Iterable<Long> ids) {
        return jpaRepository.findAllById(ids);
    }

    @Override
    public Optional<Project> findById(Long id) {
        return jpaRepository.findById(id);
    }

    @Override
    public Project save(Project project) {
        return jpaRepository.save(project);
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void approveAllElementsInProject(Long projectId) {
        jpaRepository.changeStateAllStakeholders(projectId,EntityState.APPROVED,EntityState.PENDING_APPROVAL);
        jpaRepository.changeStateAllDocuments(projectId,EntityState.APPROVED,EntityState.PENDING_APPROVAL);
        jpaRepository.changeStateAllNonFunctionalRequirements(projectId,RequirementState.APPROVED,RequirementState.PENDING_APPROVAL);
        jpaRepository.changeStateAllFunctionalRequirements(projectId,RequirementState.APPROVED,RequirementState.PENDING_APPROVAL);
    }

    @Override
    public List<Long> findAllIds() {
        return jpaRepository.findAllIds();
    }
}