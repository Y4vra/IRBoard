package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.NonFunctionalRequirementDTO;
import com.y4vra.irboardbackend.application.mappers.NonFunctionalRequirementMapper;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.model.*;
import com.y4vra.irboardbackend.domain.model.enums.RequirementState;
import com.y4vra.irboardbackend.domain.repositories.*;
import com.y4vra.irboardbackend.domain.service.EntitySlugGenerator;
import jakarta.persistence.EntityNotFoundException;
import org.jspecify.annotations.Nullable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NonFunctionalRequirementService extends RequirementService {

    private final ProjectRepository projectRepository;
    private final NonFunctionalRequirementMapper nfrMapper;

    public NonFunctionalRequirementService(NonFunctionalRequirementRepository nfrRepository,
                                           DocumentRepository documentRepository, StakeholderRepository stakeholderRepository,RequirementRepository rRepository,
                                           NonFunctionalRequirementMapper nfrMapper,
                                           PermissionService permService, ProjectRepository projectRepository) {
        super(permService,stakeholderRepository,documentRepository,nfrRepository,rRepository);
        this.projectRepository = projectRepository;
        this.nfrMapper = nfrMapper;
    }

    @Transactional(readOnly = true)
    public List<NonFunctionalRequirementDTO> findNonFunctionalRequirementsOfProject(String oryId,Long projectId) {
        boolean hasProjectAccess = permService.checkPermission("Project", String.valueOf(projectId), "view", oryId);

        if (!hasProjectAccess) {
            throw new AccessDeniedException("User not authorized to view non functional requirements of this project");
        }
        return nfrRepository.findAllByProjectId(projectId).stream()
                .map(nfrMapper::toDto)
                .collect(Collectors.toList());
    }
    @Transactional(readOnly = true)
    public NonFunctionalRequirementDTO findNonFunctionalRequirementById(String oryId, long projectId, long nonFunctionalRequirementId) {
        Optional<NonFunctionalRequirement> nonFunctionalRequirement = nfrRepository.findById(nonFunctionalRequirementId);

        if(nonFunctionalRequirement.isEmpty()) {
            throw new EntityNotFoundException("NonFunctionalRequirement with id " + nonFunctionalRequirementId + " not found");
        }
        if(nfrRepository.findRootProjectIdById(nonFunctionalRequirement.get().getId())
                .orElseThrow(() -> new EntityNotFoundException("Project linked to root nfr parent not found")) != projectId){
            throw new EntityNotFoundException("NonFunctionalRequirement with id " + nonFunctionalRequirementId + " not found");
        }
        if (!permService.checkPermission("Project", String.valueOf(projectId), "view", oryId)) {
            throw new AccessDeniedException("User not authorized to view nonFunctionalRequirements of this project");
        }
        return nfrMapper.toDto(nonFunctionalRequirement.get());
    }

    @Transactional
    public NonFunctionalRequirementDTO createNonFunctionalRequirement(String oryId, NonFunctionalRequirementDTO dto, Long projectId) {
        if (!permService.checkPermission("Project", String.valueOf(projectId), "edit", oryId)) {
            throw new AccessDeniedException("User not authorized to add a nonFunctionalRequirements to this project");
        }
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        NonFunctionalRequirement nfr = nfrMapper.toEntity(dto);
        nfr.setProjectId(projectId);
        EntitySlugGenerator.setSlug(nfr,projectId);
        nfr.setState(RequirementState.PENDING_APPROVAL);
        if (dto.parentId() != null) {
            NonFunctionalRequirement nfrParent = nfrRepository.findById(dto.parentId())
                    .orElseThrow(() -> new EntityNotFoundException("Parent not found"));
            Long parentProjectId = nfrRepository.findRootProjectIdById(dto.parentId())
                    .orElseThrow(() -> new EntityNotFoundException("Project linked to root nfr parent not found"));
            if (!Objects.equals(parentProjectId, project.getId())) {
                throw new EntityNotFoundException("Parent is not the same as this project");
            }
            Associations.link(nfrParent, nfr);
        }else{
            Associations.link(project, nfr);
        }
        NonFunctionalRequirement saved = nfrRepository.save(nfr);

        return nfrMapper.toDto(saved);
    }

    // linking & unlinking
    @Transactional
    protected void observeStakeholder(String oryId, Long projectId,Long requirementId, Long stakeholderId) {
        if (!permService.checkPermission("Project", String.valueOf(projectId), "edit", oryId)) {
            throw new AccessDeniedException("User not authorized to modify a nonFunctionalRequirements on this project");
        }
        Associations.observe(nfrRepository.findById(requirementId).orElseThrow(() -> new EntityNotFoundException("Could not find functional requirement")),
                stakeholderRepository.findById(stakeholderId).orElseThrow(()-> new EntityNotFoundException("Could not find stakeholder")));
    }
    @Transactional
    protected void observeDocument(String oryId, Long projectId,Long requirementId, Long documentId) {
        if (!permService.checkPermission("Project", String.valueOf(projectId), "edit", oryId)) {
            throw new AccessDeniedException("User not authorized to modify a nonFunctionalRequirements on this project");
        }
        Associations.observe(nfrRepository.findById(requirementId).orElseThrow(() -> new EntityNotFoundException("Could not find functional requirement")),
                documentRepository.findById(documentId).orElseThrow(()-> new EntityNotFoundException("Could not find document")));
    }
    @Transactional
    protected void unobserveStakeholder(String oryId, Long projectId,Long requirementId, Long stakeholderId) {
        if (!permService.checkPermission("Project", String.valueOf(projectId), "edit", oryId)) {
            throw new AccessDeniedException("User not authorized to modify a nonFunctionalRequirements on this project");
        }
        Associations.unobserve(nfrRepository.findById(requirementId).orElseThrow(() -> new EntityNotFoundException("Could not find functional requirement")),
                stakeholderRepository.findById(stakeholderId).orElseThrow(()-> new EntityNotFoundException("Could not find stakeholder")));
    }
    @Transactional
    protected void unobserveDocument(String oryId, Long projectId,Long requirementId, Long documentId) {
        if (!permService.checkPermission("Project", String.valueOf(projectId), "edit", oryId)) {
            throw new AccessDeniedException("User not authorized to modify a nonFunctionalRequirements on this project");
        }
        Associations.unobserve(nfrRepository.findById(requirementId).orElseThrow(() -> new EntityNotFoundException("Could not find functional requirement")),
                documentRepository.findById(documentId).orElseThrow(()-> new EntityNotFoundException("Could not find document")));
    }

    @Transactional(readOnly = true)
    public List<NonFunctionalRequirementDTO> findObservableNfRequirementsForRequirement(String oryId, Long projectId, Long requirementId) {
        if (!permService.checkPermission("Project", String.valueOf(projectId), "view", oryId)){
            throw new AccessDeniedException("User not authorized to view non functional requirements of this project");
        }
        return nfrMapper.toDtoList(nfrRepository.findObservableNfRequirementsForRequirement(projectId,requirementId));
    }
}