package com.y4vra.irboardbackend.infrastructure.persistence;

import com.y4vra.irboardbackend.domain.model.enums.EntityState;
import com.y4vra.irboardbackend.domain.model.enums.ProjectState;
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

    Optional<Project> findByIdAndState(Long projectId, ProjectState projectState);

    @Query("""
    SELECT CASE WHEN
        EXISTS (SELECT s FROM Stakeholder s WHERE s.project.id = :projectId)
        AND NOT EXISTS (SELECT s FROM Stakeholder s WHERE s.project.id = :projectId AND s.state != :state)
    THEN TRUE ELSE FALSE END
    FROM Project p WHERE p.id = :projectId
    """)
    boolean checkAllStakeholdersOfProjectAreInState(Long projectId, EntityState state);
    @Query("""
    SELECT CASE WHEN
        EXISTS (SELECT s FROM Document s WHERE s.project.id = :projectId)
        AND NOT EXISTS (SELECT s FROM Document s WHERE s.project.id = :projectId AND s.state != :state)
    THEN TRUE ELSE FALSE END
    FROM Project p WHERE p.id = :projectId
    """)
    boolean checkAllDocumentsOfProjectAreInState(Long projectId, EntityState state);
    @Query("""
    SELECT CASE WHEN
        EXISTS (SELECT s FROM NonFunctionalRequirement s WHERE s.project.id = :projectId)
        AND NOT EXISTS (SELECT s FROM NonFunctionalRequirement s WHERE s.project.id = :projectId AND s.state != :state)
    THEN TRUE ELSE FALSE END
    FROM Project p WHERE p.id = :projectId
    """)
    boolean checkAllNFROfProjectAreInState(Long projectId, RequirementState state);
    @Query("""
    SELECT CASE WHEN
        EXISTS (SELECT s FROM FunctionalRequirement s WHERE s.project.id = :projectId)
        AND NOT EXISTS (SELECT s FROM FunctionalRequirement s WHERE s.project.id = :projectId AND s.state != :state)
    THEN TRUE ELSE FALSE END
    FROM Project p WHERE p.id = :projectId
    """)
    boolean checkAllFunctionalRequirementsOfProjectAreInState(Long projectId, RequirementState state);

    void deleteByIdAndState(Long id, ProjectState state);

    @Query("""
        SELECT p FROM Project p
        WHERE p.id = :projectId
        AND p.state IN :validStates
        """)
    Optional<Project> findByIdAndStates(Long projectId, List<ProjectState> validStates);
    Optional<Project> findByIdAndStateNot(Long id, ProjectState state);

    List<Project> findAllByStateNot(ProjectState state);
    List<Project> findAllByState(ProjectState state);

}

@Component
public class ProjectRepositoryImpl implements ProjectRepository {

    private final JpaProjectRepository jpaRepository;

    public ProjectRepositoryImpl(JpaProjectRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<Project> findAllByStateNot(ProjectState state) {
        return jpaRepository.findAllByStateNot(state);
    }

    @Override
    public List<Project> findAllByState(ProjectState state) {
        return jpaRepository.findAllByState(state);
    }

    @Override
    public List<Project> findAllById(Iterable<Long> ids) {
        return jpaRepository.findAllById(ids);
    }

    @Override
    public Optional<Project> findByIdAndState(Long id, ProjectState state) {
        return jpaRepository.findByIdAndState(id,state);
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
    public void deleteByIdAndState(Long id,ProjectState state) {
        jpaRepository.deleteByIdAndState(id,state);
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

    @Override
    public boolean checkAllElementsAreFinished(Long projectId) {
        return checkAllStakeholdersOfProjectAreApproved(projectId) &&
                checkAllDocumentsOfProjectAreApproved(projectId) &&
                checkAllNFROfProjectAreFinished(projectId) &&
                checkAllFunctionalRequirementsOfProjectAreFinished(projectId);
    }

    @Override
    public Optional<Project> findByIdAndStates(Long projectId, List<ProjectState> validStates) {
        return jpaRepository.findByIdAndStates(projectId,validStates);
    }

    private boolean checkAllStakeholdersOfProjectAreApproved(Long projectId) {
        return jpaRepository.checkAllStakeholdersOfProjectAreInState(projectId,EntityState.APPROVED);
    }

    private boolean checkAllDocumentsOfProjectAreApproved(Long projectId) {
        return jpaRepository.checkAllDocumentsOfProjectAreInState(projectId,EntityState.APPROVED);
    }

    private boolean checkAllNFROfProjectAreFinished(Long projectId) {
        return jpaRepository.checkAllNFROfProjectAreInState(projectId,RequirementState.FINISHED);
    }

    private boolean checkAllFunctionalRequirementsOfProjectAreFinished(Long projectId) {
        return jpaRepository.checkAllFunctionalRequirementsOfProjectAreInState(projectId,RequirementState.FINISHED);
    }
    /*-------------------testing purposes----------------*/
    @Override
    public List<Project> findAll() {
        return jpaRepository.findAll();
    }
    @Override
    public void deleteAll() {
        jpaRepository.deleteAll();
    }
    @Override
    public void saveAll(List<Project> projects) {
        jpaRepository.saveAll(projects);
    }
}