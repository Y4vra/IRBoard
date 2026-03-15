package com.y4vra.irboardbackend.domain.repositories;

import com.y4vra.irboardbackend.domain.model.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository {
    Optional<User> findByOryId(String oryId);
    List<User> findAll();
    Optional<User> findById(Long id);
    User save(User project);
    void deleteById(Long id);
}
