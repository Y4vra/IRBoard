package com.y4vra.irboardbackend.infrastructure.persistence;

import com.y4vra.irboardbackend.domain.model.NonFunctionalRequirement;
import com.y4vra.irboardbackend.domain.repositories.NonFunctionalRequirementRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
interface JpaNonFunctionalRequirementRepository extends JpaRepository<NonFunctionalRequirement, Long> {
    List<NonFunctionalRequirement> findAllByProjectId(Long projectId);
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
}