package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.UserDTO;
import com.y4vra.irboardbackend.application.mappers.UserMapper;
import com.y4vra.irboardbackend.domain.model.User;
import com.y4vra.irboardbackend.domain.repositories.UserRepository;
import com.y4vra.irboardbackend.infrastructure.clients.KetoClient;
import com.y4vra.irboardbackend.infrastructure.clients.KratosClient;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final KetoClient ketoClient;
    private final KratosClient kratosClient;

    public UserService(UserRepository userRepository, UserMapper userMapper, KetoClient ketoClient, KratosClient kratosClient) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.ketoClient = ketoClient;
        this.kratosClient = kratosClient;
    }

    @Transactional(readOnly = true)
    public List<UserDTO> findAll() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDTO findById(Long id) {
        return userRepository.findById(id)
                .map(userMapper::toDto)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    @Transactional
    public UserDTO inviteUser(UserDTO userDTO, String adminOryId) {
        String oryId = kratosClient.createIdentity(
                userDTO.email(),
                userDTO.name(),
                userDTO.surname(),
                userDTO.isAdmin()
        );

        User user = new User();
        user.setEmail(userDTO.email());
        user.setName(userDTO.name());
        user.setSurname(userDTO.surname());
        user.setOryId(oryId);
        user.setActive(true);

        User savedUser = userRepository.save(user);

        if (userDTO.isAdmin()) {
            ketoClient.createRelation("System", "main", "admins", oryId);
        }

        kratosClient.sendInvitationCode(userDTO.email());

        return userMapper.toDto(savedUser);
    }

    @Transactional
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        user.setName(userDTO.name());
        user.setSurname(userDTO.surname());

        return userMapper.toDto(userRepository.save(user));
    }

    @Transactional
    public UserDTO generateNewInvite(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        kratosClient.sendInvitationCode(user.getEmail());

        return userMapper.toDto(user);
    }

    @Transactional
    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        user.setActive(false);
        userRepository.save(user);

        kratosClient.disableIdentity(user.getOryId());
    }

    public UserDTO getUserAuthenticatedDto(User user) {
        return userMapper.toDto(user);
    }
}