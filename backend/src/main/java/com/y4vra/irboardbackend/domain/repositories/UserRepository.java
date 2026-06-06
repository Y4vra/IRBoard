package com.y4vra.irboardbackend.domain.repositories;

import com.y4vra.irboardbackend.domain.model.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository {
    Optional<User> findByOryId(String oryId);
    Optional<User> findByEmail(String email);
    Optional<User> findById(Long id);
    User save(User project);
    void deleteByIdAndActive(Long id,Boolean active);

    List<User> findByOryIdIn(List<String> oryIds);
    List<User> findByOryIdNotIn(List<String> oryIds);

    Optional<User> findByIdAndActive(Long id,Boolean active);

    void deleteById(Long id);

    /*-------------------testing purposes----------------*/
    List<User> findAll();
    void deleteAll();
    void saveAll(List<User> users);
}
