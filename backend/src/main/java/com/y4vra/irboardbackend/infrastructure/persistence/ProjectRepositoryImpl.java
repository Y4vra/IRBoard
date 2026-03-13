package com.y4vra.irboardbackend.infrastructure.persistence;

import com.y4vra.irboardbackend.domain.repositories.ProjectRepository;
import com.y4vra.irboardbackend.domain.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
interface JpaProjectRepository extends JpaRepository<Project, Long> {}

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
}