package com.y4vra.irboardbackend.infrastructure.persistence;

import com.y4vra.irboardbackend.domain.model.User;
import com.y4vra.irboardbackend.domain.repositories.UserRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
interface JpaUserRepository extends JpaRepository<User, Long> {
    Optional<User> findByOryId(String oryId);
}

@Component
public class UserRepositoryImpl implements UserRepository {

    private final JpaUserRepository jpaRepository;

    public UserRepositoryImpl(JpaUserRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<User> findAll() {
        return jpaRepository.findAll();
    }

    @Override
    public Optional<User> findById(Long id) {
        return jpaRepository.findById(id);
    }
    @Override
    public Optional<User> findByOryId(String oryId) {
        return jpaRepository.findByOryId(oryId);
    }

    @Override
    public User save(User project) {
        return jpaRepository.save(project);
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }
}