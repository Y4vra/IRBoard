package com.y4vra.irboardbackend.infrastructure.persistence;

import com.y4vra.irboardbackend.domain.model.Requirement;
import com.y4vra.irboardbackend.domain.repositories.RequirementRepository;
import com.y4vra.irboardbackend.domain.repositories.RequirementRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
interface JpaRequirementRepository extends JpaRepository<Requirement, Long> {}

@Component
public class RequirementRepositoryImpl implements RequirementRepository {

    private final JpaRequirementRepository jpaRepository;

    public RequirementRepositoryImpl(JpaRequirementRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<Requirement> findAll() {
        return jpaRepository.findAll();
    }

    @Override
    public List<Requirement> findAllById(Iterable<Long> ids) {
        return jpaRepository.findAllById(ids);
    }

    @Override
    public Optional<Requirement> findById(Long id) {
        return jpaRepository.findById(id);
    }

}