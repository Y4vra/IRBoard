package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.UserDTO;
import com.y4vra.irboardbackend.application.mappers.UserMapper;
import com.y4vra.irboardbackend.application.ports.IdentityService;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.model.User;
import com.y4vra.irboardbackend.domain.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PermissionService permService;
    private final IdentityService identService;

    public UserService(UserRepository userRepository, UserMapper userMapper, PermissionService permService, IdentityService identService) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.permService = permService;
        this.identService = identService;
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
        String oryId = identService.createIdentity(
                userDTO.email(),
                userDTO.name(),
                userDTO.surname(),
                userDTO.isAdmin()
        );
        if (userDTO.isAdmin()) {
            permService.grantPermission("System", "main", "admins", oryId);
        }
        String flowId=identService.sendInvitationCode(userDTO.email());

        User user = userMapper.toEntity(userDTO);
        user.setOryId(oryId);
        user.setPendingActivationToken(flowId);
        userRepository.save(user);

        return userDTO;
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

        String flowId = identService.sendInvitationCode(user.getEmail());

        user.setPendingActivationToken(flowId);

        return userMapper.toDto(user);
    }

    @Transactional
    public UserDTO activateInvitedUser(String email, String code, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("USER_NOT_FOUND"));

        identService.validateRecoveryCode(email, code, user.getPendingActivationToken());

        identService.setPassword(user.getOryId(), password, user);

        user.setActive(true);
        user.setPendingActivationToken(null);
        User savedUser = userRepository.save(user);

        return userMapper.toDto(savedUser);
    }

    @Transactional
    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        user.setActive(false);
        userRepository.save(user);

        identService.disableIdentity(user.getOryId());
    }

    public UserDTO getUserAuthenticatedDto(User user) {
        return userMapper.toDto(user);
    }
}