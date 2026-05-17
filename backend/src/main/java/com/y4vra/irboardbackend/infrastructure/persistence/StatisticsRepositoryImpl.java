package com.y4vra.irboardbackend.infrastructure.persistence;

import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.repositories.ProjectRepository;
import com.y4vra.irboardbackend.domain.repositories.StatisticsRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
interface JpaStatisticsRepository extends JpaRepository<Project, Long> {
    @Query("""
        SELECT s.state, COUNT(s)
        FROM Stakeholder s
        WHERE s.project.id = :projectId
        AND s.state <> 'DEACTIVATED'
        GROUP BY s.state
        """)
    List<Object[]> countStakeholdersByState(@Param("projectId") Long projectId);

//    @Query("""
//        SELECT d.state, COUNT(d)
//        FROM Document d
//        WHERE d.project.id = :projectId
//        GROUP BY d.state
//        """)
//    List<Object[]> countDocumentsByState(@Param("projectId") Long projectId);

    @Query("""
        SELECT r.state, COUNT(r)
        FROM NonFunctionalRequirement r
        WHERE r.project.id = :projectId
        AND r.state <> 'DEACTIVATED'
        GROUP BY r.state
        """)
    List<Object[]> countNonFunctionalRequirementsByState(@Param("projectId") Long projectId);

    @Query("""
        SELECT r.state, COUNT(r)
        FROM FunctionalRequirement r
        WHERE r.functionality.project.id = :projectId
        AND r.state <> 'DEACTIVATED'
        GROUP BY r.state
        """)
    List<Object[]> countAllFunctionalRequirementsByState(@Param("projectId") Long projectId);

    @Query("""
        SELECT r.state, COUNT(r)
        FROM FunctionalRequirement r
        WHERE r.functionality.id = :functionalityId
        AND r.functionality.project.id = :projectId
        AND r.state <> 'DEACTIVATED'
        GROUP BY r.state
        """)
    List<Object[]> countFunctionalRequirementsByFunctionality(
            @Param("projectId") Long projectId,
            @Param("functionalityId") Long functionalityId
    );

    @Query("""
    SELECT r.functionality.id, r.state, COUNT(r)
    FROM FunctionalRequirement r
    WHERE r.functionality.project.id = :projectId
    AND r.state <> 'DEACTIVATED'
    GROUP BY r.functionality.id, r.state
    """)
    List<Object[]> countFunctionalRequirementsByFunctionality(@Param("projectId") Long projectId);
}

@Component
public class StatisticsRepositoryImpl implements StatisticsRepository {

    private final JpaStatisticsRepository jpaRepository;

    public StatisticsRepositoryImpl(JpaStatisticsRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    private Map<String, Long> toMap(List<Object[]> rows) {
        return rows.stream().collect(Collectors.toMap(
                row -> row[0].toString(),
                row -> (Long) row[1]
        ));
    }

    @Override
    public Map<String, Long> getStakeholderStatistics(Long projectId) {
        return toMap(jpaRepository.countStakeholdersByState(projectId));
    }

//    @Override
//    public Map<String, Long> getDocumentStatistics(Long projectId) {
//        return toMap(jpaRepository.countDocumentsByState(projectId));
//    }

    @Override
    public Map<String, Long> getNonFunctionalRequirementStatistics(Long projectId) {
        return toMap(jpaRepository.countNonFunctionalRequirementsByState(projectId));
    }

    @Override
    public Map<String, Long> getGlobalFunctionalityStatistics(Long projectId) {
        return toMap(jpaRepository.countAllFunctionalRequirementsByState(projectId));
    }

    @Override
    public Map<String, Long> getFunctionalityStatistics(Long projectId, Long functionalityId) {
        return toMap(jpaRepository.countFunctionalRequirementsByFunctionality(projectId, functionalityId));
    }

    @Override
    public Map<String, Map<String, Long>> getFunctionalitiesStatistics(Long projectId) {
        return jpaRepository.countFunctionalRequirementsByFunctionality(projectId).stream()
                .collect(Collectors.groupingBy(
                        row -> row[0].toString(),
                        Collectors.toMap(
                                row -> row[1].toString(), // state
                                row -> (Long) row[2]      // count
                        )
                ));
    }
}