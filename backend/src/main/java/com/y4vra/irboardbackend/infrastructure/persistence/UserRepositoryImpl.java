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
    Optional<User> findByEmail(String email);

    List<User> findByOryIdIn(List<String> oryIds);
    List<User> findByOryIdNotIn(List<String> oryIds);

    void deleteByIdAndActive(Long id, Boolean active);

    Optional<User> findByIdAndActive(Long id, Boolean active);
}

@Component
public class UserRepositoryImpl implements UserRepository {

    private final JpaUserRepository jpaRepository;

    public UserRepositoryImpl(JpaUserRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
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
    public Optional<User> findByEmail(String email) {
        return jpaRepository.findByEmail(email);
    }

    @Override
    public User save(User project) {
        return jpaRepository.save(project);
    }

    @Override
    public void deleteByIdAndActive(Long id,Boolean active) {
        jpaRepository.deleteByIdAndActive(id,active);
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public List<User> findByOryIdIn(List<String> oryIds) {
        return jpaRepository.findByOryIdIn(oryIds);
    }

    @Override
    public List<User> findByOryIdNotIn(List<String> oryIds) {
        return jpaRepository.findByOryIdNotIn(oryIds);
    }

    @Override
    public Optional<User> findByIdAndActive(Long id,Boolean active) {
        return jpaRepository.findByIdAndActive(id,active);
    }

    /*-------------------testing purposes----------------*/
    @Override
    public List<User> findAll() {
        return jpaRepository.findAll();
    }
    @Override
    public void deleteAll() {
        jpaRepository.deleteAll();
    }
    @Override
    public void saveAll(List<User> users) {
        jpaRepository.saveAll(users);
    }
}