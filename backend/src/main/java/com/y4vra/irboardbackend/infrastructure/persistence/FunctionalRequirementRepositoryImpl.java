package com.y4vra.irboardbackend.infrastructure.persistence;

import com.y4vra.irboardbackend.domain.model.FunctionalRequirement;
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
}