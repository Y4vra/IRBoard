package com.y4vra.irboardbackend.infrastructure.persistence;

import com.y4vra.irboardbackend.domain.model.Functionality;
import com.y4vra.irboardbackend.domain.repositories.FunctionalityRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
interface JpaFunctionalityRepository extends JpaRepository<Functionality, Long> {
    List<Functionality> findByProjectId(Long projectId);
    @Query("SELECT f.id FROM Functionality f WHERE f.project.id = :projectId")
    Set<Long> findIdsByProjectId(long projectId);
}

@Component
public class FunctionalityRepositoryImpl implements FunctionalityRepository {

    private final JpaFunctionalityRepository jpaRepository;

    public FunctionalityRepositoryImpl(JpaFunctionalityRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<Functionality> findAll() {
        return jpaRepository.findAll();
    }

    @Override
    public List<Functionality> findAllById(Iterable<Long> ids) {
        return jpaRepository.findAllById(ids);
    }

    @Override
    public List<Functionality> findByProjectId(Long projectId) {
        return jpaRepository.findByProjectId(projectId);
    }

    @Override
    public Optional<Functionality> findById(Long id) {
        return jpaRepository.findById(id);
    }

    @Override
    public Functionality save(Functionality functionality) {
        return jpaRepository.save(functionality);
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public Set<Long> findIdsByProjectId(long projectId){
        return jpaRepository.findIdsByProjectId(projectId);
    }
}