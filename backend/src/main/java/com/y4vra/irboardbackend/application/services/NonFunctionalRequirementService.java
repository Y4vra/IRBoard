package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.NonFunctionalRequirementDTO;
import com.y4vra.irboardbackend.application.mappers.NonFunctionalRequirementMapper;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.model.*;
import com.y4vra.irboardbackend.domain.model.enums.RequirementState;
import com.y4vra.irboardbackend.domain.repositories.*;
import com.y4vra.irboardbackend.domain.service.EntitySlugGenerator;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
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
    private FunctionalRequirementRepository frRepository;

    @Autowired
    public void setFunctionalRequirementRepository(FunctionalRequirementRepository frRepository) {
        this.frRepository = frRepository;
    }

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
        return nfrMapper.toDetailedDto(nonFunctionalRequirement.get(),
                stakeholderRepository.findAllObservedByRequirement(nonFunctionalRequirementId),
                nfrRepository.findAllObservedByRequirement(nonFunctionalRequirementId),
                documentRepository.findAllObservedByRequirement(nonFunctionalRequirementId),
                frRepository.findAllObservedByRequirement(nonFunctionalRequirementId));
    }

    @Transactional
    public NonFunctionalRequirementDTO createNonFunctionalRequirement(String oryId, NonFunctionalRequirementDTO dto, Long projectId) {
        if (!permService.checkPermission("Project", String.valueOf(projectId), "edit", oryId)) {
            throw new AccessDeniedException("User not authorized to add a nonFunctionalRequirements to this project");
        }
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        NonFunctionalRequirement nfr = nfrMapper.toEntity(dto);
        Associations.link(project,nfr);
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
        }
        NonFunctionalRequirement saved = nfrRepository.save(nfr);

        return nfrMapper.toDto(saved);
    }

    // linking & unlinking
    @Transactional
    public void observeStakeholder(String oryId, Long projectId,Long requirementId, Long stakeholderId) {
        if (!permService.checkPermission("Project", String.valueOf(projectId), "edit", oryId)) {
            throw new AccessDeniedException("User not authorized to modify a nonFunctionalRequirements on this project");
        }
        Associations.observe(nfrRepository.findById(requirementId).orElseThrow(() -> new EntityNotFoundException("Could not find functional requirement")),
                stakeholderRepository.findById(stakeholderId).orElseThrow(()-> new EntityNotFoundException("Could not find stakeholder")));
    }
    @Transactional
    public void observeDocument(String oryId, Long projectId,Long requirementId, Long documentId) {
        if (!permService.checkPermission("Project", String.valueOf(projectId), "edit", oryId)) {
            throw new AccessDeniedException("User not authorized to modify a nonFunctionalRequirements on this project");
        }
        Associations.observe(nfrRepository.findById(requirementId).orElseThrow(() -> new EntityNotFoundException("Could not find functional requirement")),
                documentRepository.findById(documentId).orElseThrow(()-> new EntityNotFoundException("Could not find document")));
    }
    @Transactional
    public void unobserveStakeholder(String oryId, Long projectId,Long requirementId, Long stakeholderId) {
        if (!permService.checkPermission("Project", String.valueOf(projectId), "edit", oryId)) {
            throw new AccessDeniedException("User not authorized to modify a nonFunctionalRequirements on this project");
        }
        Associations.unobserve(nfrRepository.findById(requirementId).orElseThrow(() -> new EntityNotFoundException("Could not find functional requirement")),
                stakeholderRepository.findById(stakeholderId).orElseThrow(()-> new EntityNotFoundException("Could not find stakeholder")));
    }
    @Transactional
    public void unobserveDocument(String oryId, Long projectId,Long requirementId, Long documentId) {
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
    @Transactional
    public void reorderRequirement(String oryId, Long projectId, Long nonFunctionalRequirementId, Long orderValue) {
        if (!permService.checkPermission("Project", String.valueOf(projectId), "edit", oryId)){
            throw new AccessDeniedException("User not authorized to modify requirements in functionality");
        }
        projectRepository.findById(projectId).orElseThrow(()-> new EntityNotFoundException("Could not find functionality"));
        NonFunctionalRequirement nfr = nfrRepository.findById(nonFunctionalRequirementId).orElseThrow(()-> new EntityNotFoundException("Could not find functional requirement"));
        if(!Objects.equals(nfr.getProject().getId(), projectId)){
            throw new EntityNotFoundException("Project id does not match requirement's project id");
        }
        nfr.setOrderValue(orderValue);
    }
    @Transactional
    public void changeParent(String oryId, Long projectId, Long nonFunctionalRequirementId, Long newParentId) {
        if (!permService.checkPermission("Project", String.valueOf(projectId), "edit", oryId)){
            throw new AccessDeniedException("User not authorized to modify requirements in project");
        }
        projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Could not find project"));
        NonFunctionalRequirement nfr = nfrRepository.findByIdWithParent(nonFunctionalRequirementId)
                .orElseThrow(() -> new EntityNotFoundException("Could not find non functional requirement"));
        if (!Objects.equals(nfr.getProject().getId(), projectId))
            throw new EntityNotFoundException("Functionality id does not match project id");

        if (nfr.getParent() != null) {
            NonFunctionalRequirement currentParent = nfrRepository
                    .findByIdWithChildren(nfr.getParent().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Could not find current parent"));
            Associations.unlink(currentParent, nfr);
        }
        if (newParentId != null) {
            NonFunctionalRequirement newParent = nfrRepository.findById(newParentId)
                    .orElseThrow(() -> new EntityNotFoundException("Could not find parent"));
            if (!Objects.equals(newParent.getProject().getId(), projectId))
                throw new EntityNotFoundException("Parent project id does not match current requirement's project id");
            Associations.link(newParent, nfr);
        }
    }
}