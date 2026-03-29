package com.y4vra.irboardbackend.infrastructure.persistence;

import com.y4vra.irboardbackend.domain.model.Stakeholder;
import com.y4vra.irboardbackend.domain.repositories.StakeholderRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
interface JpaStakeholderRepository extends JpaRepository<Stakeholder, Long> {
    List<Stakeholder> findByProjectId(Long projectId);
}

@Component
public class StakeholderRepositoryImpl implements StakeholderRepository {

    private final JpaStakeholderRepository jpaRepository;

    public StakeholderRepositoryImpl(JpaStakeholderRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<Stakeholder> findAll() {
        return jpaRepository.findAll();
    }

    @Override
    public List<Stakeholder> findAllById(Iterable<Long> ids) {
        return jpaRepository.findAllById(ids);
    }

    @Override
    public Optional<Stakeholder> findById(Long id) {
        return jpaRepository.findById(id);
    }

    @Override
    public List<Stakeholder> findByProjectId(Long projectId) {
        return jpaRepository.findByProjectId(projectId);
    }

    @Override
    public Stakeholder save(Stakeholder stakeholder) {
        return jpaRepository.save(stakeholder);
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }
}