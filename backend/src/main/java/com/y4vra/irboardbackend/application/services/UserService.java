package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.UserDTO;
import com.y4vra.irboardbackend.application.mappers.UserMapper;
import com.y4vra.irboardbackend.application.ports.IdentityService;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.errors.LockableEntityException;
import com.y4vra.irboardbackend.domain.model.User;
import com.y4vra.irboardbackend.domain.repositories.FunctionalityRepository;
import com.y4vra.irboardbackend.domain.repositories.ProjectRepository;
import com.y4vra.irboardbackend.domain.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.jspecify.annotations.Nullable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PermissionService permService;
    private final IdentityService identService;
    private final EntityLockService entityLockService;
    private final ProjectRepository projectRepository;
    private final FunctionalityRepository functionalityRepository;

    public UserService(UserRepository userRepository, UserMapper userMapper, PermissionService permService, IdentityService identService, EntityLockService entityLockService, ProjectRepository projectRepository, FunctionalityRepository functionalityRepository) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.permService = permService;
        this.identService = identService;
        this.entityLockService = entityLockService;
        this.projectRepository = projectRepository;
        this.functionalityRepository = functionalityRepository;
    }

    @Transactional(readOnly = true)
    public List<UserDTO> findAll() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }
    @Transactional(readOnly = true)
    public Map<String, List<UserDTO>> findAllForProject(Long projectId) {
        List<String> managerOryIds = permService.getSubjectsForObject(
                "Project", String.valueOf(projectId), "managers"
        );

        Set<String> managerSet = new HashSet<>(managerOryIds);

        List<UserDTO> managers = userRepository.findByOryIdIn(managerOryIds)
                .stream()
                .map(userMapper::toDto)
                .toList();

        List<UserDTO> notManagers = userRepository.findByOryIdNotIn(managerOryIds)
                .stream()
                .map(userMapper::toDto)
                .toList();

        return Map.of(
                "managers", managers,
                "not_managers", notManagers
        );
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

    @Transactional
    public void requestEdit(Long id, User user) {
        User userEntity = userRepository.findById(id).orElseThrow(()->new EntityNotFoundException("User not found"));
        entityLockService.lock(userEntity,user);
    }

    @Transactional
    public UserDTO patch(Long id, UserDTO patch, User user) {
        User userEntity = userRepository.findById(id).orElseThrow(()->new EntityNotFoundException("User not found"));
        if(!entityLockService.isLockedByUser(userEntity, user)) {
            throw new LockableEntityException("You do not hold the lock for this project");
        }
        userMapper.patchEntity(patch, userEntity);
        return userMapper.toDto(userRepository.save(userEntity));
    }

    @Transactional(readOnly = true)
    public Map<String, List<UserDTO>> findAllForProjectsFunctionality(String oryId, Long projectId, Long functionalityId) {
        if (!permService.checkPermission("Project", String.valueOf(projectId), "linkProjectUsers", oryId))
            throw new AccessDeniedException("User not authorized to link users to this project");

        List<String> managerOryIds = permService.getSubjectsForObject(
                "Project", String.valueOf(projectId), "managers"
        );

        List<String> engineerOryIds = permService.getSubjectsForObject(
                "Functionality", String.valueOf(functionalityId), "engineers"
        );

        List<String> stakeholderOryIds = permService.getSubjectsForObject(
                "Functionality", String.valueOf(functionalityId), "stakeholders"
        );

        Set<String> assignedOryIds = new HashSet<>();
        assignedOryIds.addAll(managerOryIds);
        assignedOryIds.addAll(engineerOryIds);
        assignedOryIds.addAll(stakeholderOryIds);

        List<UserDTO> managers = userRepository.findByOryIdIn(managerOryIds)
                .stream()
                .map(userMapper::toDto)
                .toList();

        List<UserDTO> engineers = userRepository.findByOryIdIn(engineerOryIds)
                .stream()
                .map(userMapper::toDto)
                .toList();

        List<UserDTO> stakeholders = userRepository.findByOryIdIn(stakeholderOryIds)
                .stream()
                .map(userMapper::toDto)
                .toList();

        List<UserDTO> others = userRepository.findByOryIdNotIn(assignedOryIds.stream().toList())
                .stream()
                .map(userMapper::toDto)
                .toList();

        return Map.of(
                "project_managers", managers,
                "requirement_engineers", engineers,
                "stakeholders", stakeholders,
                "others", others
        );
    }

    @Transactional
    public void linkUserToProject(Long projectId, Long userIdToBeLinked) {
        projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        String oryId=userRepository.findById(userIdToBeLinked)
                .orElseThrow(() -> new EntityNotFoundException("User not found")).getOryId();

        permService.grantPermission("Project", String.valueOf(projectId), "managers", oryId);
    }
    @Transactional
    public void linkUserToProjectsFunctionality(String oryId, Long projectId, Long functionalityId, Long userIdToBeLinked,String relation) {
        if (!permService.checkPermission("Project", String.valueOf(projectId), "linkProjectUsers", oryId))
            throw new AccessDeniedException("User not authorized to link users to this project");
        projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        functionalityRepository.findById(functionalityId)
                .orElseThrow(() -> new EntityNotFoundException("Functionality not found"));

        String userOryIdToBeLinked=userRepository.findById(userIdToBeLinked)
                .orElseThrow(() -> new EntityNotFoundException("User not found")).getOryId();

        permService.grantPermission("Functionality", String.valueOf(functionalityId), relation, userOryIdToBeLinked);
    }
}