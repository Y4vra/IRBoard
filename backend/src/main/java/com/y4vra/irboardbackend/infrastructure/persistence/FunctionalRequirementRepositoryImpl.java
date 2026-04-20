package com.y4vra.irboardbackend.infrastructure.persistence;

import com.y4vra.irboardbackend.domain.model.FunctionalRequirement;
import com.y4vra.irboardbackend.domain.repositories.FunctionalRequirementRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
interface JpaFunctionalRequirementRepository extends JpaRepository<FunctionalRequirement, Long> {
    List<FunctionalRequirement> findAllByFunctionalityId(Long functionalityId);
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
}