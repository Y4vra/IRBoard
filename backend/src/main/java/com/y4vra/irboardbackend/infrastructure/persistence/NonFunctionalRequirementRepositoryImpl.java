package com.y4vra.irboardbackend.infrastructure.persistence;

import com.y4vra.irboardbackend.domain.model.NonFunctionalRequirement;
import com.y4vra.irboardbackend.domain.repositories.NonFunctionalRequirementRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
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
}