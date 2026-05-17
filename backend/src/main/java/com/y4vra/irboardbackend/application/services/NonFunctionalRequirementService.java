package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.FunctionalRequirementDTO;
import com.y4vra.irboardbackend.application.dtos.NonFunctionalRequirementDTO;
import com.y4vra.irboardbackend.application.mappers.NonFunctionalRequirementMapper;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.errors.LockableEntityException;
import com.y4vra.irboardbackend.domain.model.*;
import com.y4vra.irboardbackend.domain.model.enums.RequirementState;
import com.y4vra.irboardbackend.domain.repositories.*;
import com.y4vra.irboardbackend.domain.service.EntitySlugGenerator;
import jakarta.persistence.EntityNotFoundException;
import org.jspecify.annotations.Nullable;
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
                                           PermissionService permService, ProjectRepository projectRepository, EntityLockService lockService) {
        super(permService,stakeholderRepository,documentRepository,nfrRepository,rRepository,lockService);
        this.projectRepository = projectRepository;
        this.nfrMapper = nfrMapper;
    }

    private void checkEditPermission(String oryId,String projectId){
        if (!permService.checkPermission("Project", String.valueOf(projectId), "edit", oryId)) {
            throw new AccessDeniedException("User not authorized to edit nonFunctionalRequirements in this project");
        }
    }
    private void checkViewPermission(String oryId,String projectId){
        if (!permService.checkPermission("Project", String.valueOf(projectId), "view", oryId)){
            throw new AccessDeniedException("User not authorized to view non functional requirements of this project");
        }
    }

    @Transactional(readOnly = true)
    public List<NonFunctionalRequirementDTO> findNonFunctionalRequirementsOfProject(String oryId,Long projectId) {
        checkViewPermission(oryId,String.valueOf(projectId));
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
        checkViewPermission(oryId,String.valueOf(projectId));
        return nfrMapper.toDetailedDto(nonFunctionalRequirement.get(),
                stakeholderRepository.findAllObservedByRequirement(nonFunctionalRequirementId),
                nfrRepository.findAllObservedByRequirement(nonFunctionalRequirementId),
                documentRepository.findAllObservedByRequirement(nonFunctionalRequirementId),
                frRepository.findAllObservedByRequirement(nonFunctionalRequirementId));
    }

    @Transactional
    public NonFunctionalRequirementDTO createNonFunctionalRequirement(String oryId, NonFunctionalRequirementDTO dto, Long projectId) {
        checkEditPermission(oryId,String.valueOf(projectId));
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
        checkEditPermission(oryId,String.valueOf(projectId));
        Associations.observe(nfrRepository.findById(requirementId).orElseThrow(() -> new EntityNotFoundException("Could not find functional requirement")),
                stakeholderRepository.findById(stakeholderId).orElseThrow(()-> new EntityNotFoundException("Could not find stakeholder")));
    }
    @Transactional
    public void observeDocument(String oryId, Long projectId,Long requirementId, Long documentId) {
        checkEditPermission(oryId,String.valueOf(projectId));
        Associations.observe(nfrRepository.findById(requirementId).orElseThrow(() -> new EntityNotFoundException("Could not find functional requirement")),
                documentRepository.findById(documentId).orElseThrow(()-> new EntityNotFoundException("Could not find document")));
    }
    @Transactional
    public void unobserveStakeholder(String oryId, Long projectId,Long requirementId, Long stakeholderId) {
        checkEditPermission(oryId,String.valueOf(projectId));
        Associations.unobserve(nfrRepository.findById(requirementId).orElseThrow(() -> new EntityNotFoundException("Could not find functional requirement")),
                stakeholderRepository.findById(stakeholderId).orElseThrow(()-> new EntityNotFoundException("Could not find stakeholder")));
    }
    @Transactional
    public void unobserveDocument(String oryId, Long projectId,Long requirementId, Long documentId) {
        checkEditPermission(oryId,String.valueOf(projectId));
        Associations.unobserve(nfrRepository.findById(requirementId).orElseThrow(() -> new EntityNotFoundException("Could not find functional requirement")),
                documentRepository.findById(documentId).orElseThrow(()-> new EntityNotFoundException("Could not find document")));
    }

    @Transactional(readOnly = true)
    public List<NonFunctionalRequirementDTO> findObservableNfRequirementsForRequirement(String oryId, Long projectId, Long requirementId) {
        checkViewPermission(oryId,String.valueOf(projectId));
        return nfrMapper.toDtoList(nfrRepository.findObservableNfRequirementsForRequirement(projectId,requirementId));
    }
    @Transactional
    public void reorderRequirement(String oryId, Long projectId, Long nonFunctionalRequirementId, Long orderValue) {
        checkEditPermission(oryId,String.valueOf(projectId));
        projectRepository.findById(projectId).orElseThrow(()-> new EntityNotFoundException("Could not find functionality"));
        NonFunctionalRequirement nfr = nfrRepository.findById(nonFunctionalRequirementId).orElseThrow(()-> new EntityNotFoundException("Could not find functional requirement"));
        if(!Objects.equals(nfr.getProject().getId(), projectId)){
            throw new EntityNotFoundException("Project id does not match requirement's project id");
        }
        nfr.setOrderValue(orderValue);
    }
    @Transactional
    public void changeParent(String oryId, Long projectId, Long nonFunctionalRequirementId, Long newParentId) {
        checkEditPermission(oryId,String.valueOf(projectId));
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
    @Transactional
    public NonFunctionalRequirementDTO patch(User user, Long projectId, Long requirementId, NonFunctionalRequirementDTO patch) {
        checkEditPermission(user.getOryId(),String.valueOf(projectId));
        NonFunctionalRequirement requirement = nfrRepository.findById(requirementId).orElseThrow(()->new EntityNotFoundException("Requirement not found"));
        if(!entityLockService.isLockedByUser(requirement, user)) {
            throw new LockableEntityException("You do not hold the lock for this project");
        }
        nfrMapper.patchEntity(patch, requirement);
        entityLockService.unlock(requirement,user);
        requirement.setState(RequirementState.PENDING_APPROVAL);
        requirement.notifyObservers();
        return nfrMapper.toDto(nfrRepository.save(requirement));
    }
    @Transactional
    public void approveRequirements(String oryId, Long projectId, List<Long> functionalRequirementIds) {
        checkEditPermission(oryId,String.valueOf(projectId));
        if (!nfrRepository.allFunctionalRequirementsBelongToFunctionalityAndProject(projectId,functionalRequirementIds))
            throw new EntityNotFoundException("One of the elements was not found on the system");
        nfrRepository.updateStateByIdsAndFunctionalityAndProject(functionalRequirementIds,projectId,RequirementState.APPROVED,RequirementState.PENDING_APPROVAL);
    }
}