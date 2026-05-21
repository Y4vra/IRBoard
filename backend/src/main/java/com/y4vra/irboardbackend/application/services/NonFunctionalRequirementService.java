package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.NonFunctionalRequirementDTO;
import com.y4vra.irboardbackend.application.mappers.NonFunctionalRequirementMapper;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.errors.LockableEntityException;
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
        if (!permService.checkPermission("Project", projectId, "edit", oryId)) {
            throw new AccessDeniedException("User not authorized to edit nonFunctionalRequirements in this project");
        }
    }
    private void checkViewPermission(String oryId,String projectId){
        if (!permService.checkPermission("Project", projectId, "view", oryId)){
            throw new AccessDeniedException("User not authorized to view non functional requirements of this project");
        }
    }

    @Transactional(readOnly = true)
    public List<NonFunctionalRequirementDTO> findNonFunctionalRequirementsNotRemovedOfProject(String oryId, Long projectId) {
        checkViewPermission(oryId,String.valueOf(projectId));
        return nfrRepository.findAllByProjectIdNotRemoved(projectId).stream()
                .map(nfrMapper::toDto)
                .collect(Collectors.toList());
    }
    @Transactional(readOnly = true)
    public List<NonFunctionalRequirementDTO> findNonFunctionalRequirementsRemovedOfProject(String oryId, Long projectId) {
        checkViewPermission(oryId,String.valueOf(projectId));
        return nfrRepository.findAllByProjectIdRemoved(projectId).stream()
                .map(nfrMapper::toDto)
                .collect(Collectors.toList());
    }
    @Transactional(readOnly = true)
    public NonFunctionalRequirementDTO findNonFunctionalRequirementById(String oryId, long projectId, long nonFunctionalRequirementId) {
        checkViewPermission(oryId,String.valueOf(projectId));
        NonFunctionalRequirement nonFunctionalRequirement = nfrRepository.findByIdAndProjectId(nonFunctionalRequirementId,projectId).orElseThrow(()-> new EntityNotFoundException("NonFunctionalRequirement not found"));
        if (nonFunctionalRequirement.getState()== RequirementState.REMOVED){
            checkProjectManagerPermission(oryId,String.valueOf(projectId));
        }
        return nfrMapper.toDetailedDto(nonFunctionalRequirement,
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
            NonFunctionalRequirement nfrParent = nfrRepository.findByIdAndProjectId(dto.parentId(),projectId)
                    .orElseThrow(() -> new EntityNotFoundException("Parent not found"));
            Associations.link(nfrParent, nfr);
        }
        NonFunctionalRequirement saved = nfrRepository.save(nfr);

        return nfrMapper.toDto(saved);
    }

    // linking & unlinking
    @Transactional
    public void observeStakeholder(String oryId, Long projectId,Long requirementId, Long stakeholderId) {
        checkEditPermission(oryId,String.valueOf(projectId));
        Associations.observe(nfrRepository.findByIdAndProjectId(requirementId,projectId).orElseThrow(() -> new EntityNotFoundException("Could not find functional requirement")),
                stakeholderRepository.findByIdAndProjectId(stakeholderId,projectId).orElseThrow(()-> new EntityNotFoundException("Could not find stakeholder")));
    }
    @Transactional
    public void observeDocument(String oryId, Long projectId,Long requirementId, Long documentId) {
        checkEditPermission(oryId,String.valueOf(projectId));
        Associations.observe(nfrRepository.findByIdAndProjectId(requirementId,projectId).orElseThrow(() -> new EntityNotFoundException("Could not find functional requirement")),
                documentRepository.findByIdAndProjectId(documentId,projectId).orElseThrow(()-> new EntityNotFoundException("Could not find document")));
    }
    @Transactional
    public void unobserveStakeholder(String oryId, Long projectId,Long requirementId, Long stakeholderId) {
        checkEditPermission(oryId,String.valueOf(projectId));
        Associations.unobserve(nfrRepository.findByIdAndProjectId(requirementId,projectId).orElseThrow(() -> new EntityNotFoundException("Could not find functional requirement")),
                stakeholderRepository.findByIdAndProjectId(stakeholderId,projectId).orElseThrow(()-> new EntityNotFoundException("Could not find stakeholder")));
    }
    @Transactional
    public void unobserveDocument(String oryId, Long projectId,Long requirementId, Long documentId) {
        checkEditPermission(oryId,String.valueOf(projectId));
        Associations.unobserve(nfrRepository.findByIdAndProjectId(requirementId,projectId).orElseThrow(() -> new EntityNotFoundException("Could not find functional requirement")),
                documentRepository.findByIdAndProjectId(documentId,projectId).orElseThrow(()-> new EntityNotFoundException("Could not find document")));
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
        NonFunctionalRequirement nfr = nfrRepository.findByIdAndProjectId(nonFunctionalRequirementId,projectId).orElseThrow(()-> new EntityNotFoundException("Could not find functional requirement"));
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
        NonFunctionalRequirement nfr = nfrRepository.findByIdWithParentAndProjectId(nonFunctionalRequirementId,projectId)
                .orElseThrow(() -> new EntityNotFoundException("Could not find non functional requirement"));
        nfr.checkCanBeModified();

        if (nfr.getParent() != null) {
            NonFunctionalRequirement currentParent = nfrRepository
                    .findByIdWithChildrenAndProjectId(nfr.getParent().getId(),projectId)
                    .orElseThrow(() -> new EntityNotFoundException("Could not find current parent"));
            Associations.unlink(currentParent, nfr);
        }
        if (newParentId != null) {
            NonFunctionalRequirement newParent = nfrRepository.findByIdAndProjectId(newParentId,projectId)
                    .orElseThrow(() -> new EntityNotFoundException("Could not find parent"));
            Associations.link(newParent, nfr);
        }
    }
    @Transactional
    public NonFunctionalRequirementDTO patch(User user, Long projectId, Long requirementId, NonFunctionalRequirementDTO patch) {
        checkEditPermission(user.getOryId(),String.valueOf(projectId));
        NonFunctionalRequirement requirement = nfrRepository.findByIdAndProjectId(requirementId,projectId).orElseThrow(()->new EntityNotFoundException("Requirement not found"));
        if(!entityLockService.isLockedByUser(requirement, user)) {
            throw new LockableEntityException("You do not hold the lock for this project");
        }
        requirement.checkCanBeModified();
        nfrMapper.patchEntity(patch, requirement);
        entityLockService.unlock(requirement,user);
        requirement.setState(RequirementState.PENDING_APPROVAL);
        requirement.notifyObservers();
        return nfrMapper.toDto(nfrRepository.save(requirement));
    }
    @Transactional
    public void approveRequirements(String oryId, Long projectId, List<Long> nonFunctionalRequirementIds) {
        checkProjectManagerPermission(oryId,String.valueOf(projectId));
        if (!nfrRepository.allNonFunctionalRequirementsBelongToProject(projectId,nonFunctionalRequirementIds))
            throw new EntityNotFoundException("One of the elements was not found on the system");
        nfrRepository.updateStateByIdsAndProject(nonFunctionalRequirementIds,projectId,RequirementState.APPROVED,RequirementState.PENDING_APPROVAL);
    }
    @Transactional
    public void finishRequirements(String oryId, Long projectId, List<Long> nonFunctionalRequirementIds) {
        checkProjectManagerPermission(oryId,String.valueOf(projectId));
        if (!nfrRepository.allNonFunctionalRequirementsBelongToProject(projectId,nonFunctionalRequirementIds))
            throw new EntityNotFoundException("One of the elements was not found on the system");
        nfrRepository.findAllByIdsAndProjectIdAndState(nonFunctionalRequirementIds,projectId, RequirementState.APPROVED).forEach(
            nfr ->{
                if(nfr.isPassing()){
                    throw new IllegalStateException("A non-passing requirement cannot be marked as finished.");
                }
                nfr.setState(RequirementState.FINISHED);
            }
        );
    }
    @Transactional
    public void disableNonFunctionalRequirements(String oryId, Long projectId, List<Long> nonFunctionalRequirementIds) {
        checkEditPermission(oryId,String.valueOf(projectId));
        if (!nfrRepository.allNonFunctionalRequirementsBelongToProject(projectId,nonFunctionalRequirementIds)){
            throw new EntityNotFoundException("One of the elements was not found on the system");
        }
        List<RequirementState> validStatesList= List.of(RequirementState.PENDING_APPROVAL,RequirementState.APPROVED,RequirementState.REMOVED);
        nfrRepository.findAllByIdsAndProjectIdAndState(nonFunctionalRequirementIds,projectId, validStatesList).forEach(
        nonFunctionalRequirement -> {
            nfrRepository.findAllDescendantsOf(nonFunctionalRequirement.getId())
                    .stream()
                    .filter(child -> validStatesList.contains(child.getState()))
                    .forEach(child -> {
                        child.setState(RequirementState.DEACTIVATED);
                        child.notifyObservers();
                    });
            nonFunctionalRequirement.setState(RequirementState.DEACTIVATED);
            nonFunctionalRequirement.notifyObservers();
        });
    }
    @Transactional
    public void enableNonFunctionalRequirements(String oryId, Long projectId, List<Long> nonFunctionalRequirementIds) {
        checkEditPermission(oryId,String.valueOf(projectId));
        if (!nfrRepository.allNonFunctionalRequirementsBelongToProject(projectId,nonFunctionalRequirementIds)){
            throw new EntityNotFoundException("One of the elements was not found on the system");
        }
        nfrRepository.findAllByIdsAndProjectIdAndState(nonFunctionalRequirementIds,projectId, RequirementState.DEACTIVATED).forEach(nonFunctionalRequirement -> {
            nonFunctionalRequirement.setState(RequirementState.PENDING_APPROVAL);
            nonFunctionalRequirement.notifyObservers();
        });
    }
    @Transactional
    public void removeNonFunctionalRequirements(String oryId, Long projectId, List<Long> nonFunctionalRequirementIds) {
        checkEditPermission(oryId,String.valueOf(projectId));
        if (!nfrRepository.allNonFunctionalRequirementsBelongToProject(projectId,nonFunctionalRequirementIds)){
            throw new EntityNotFoundException("One of the elements was not found on the system");
        }
        nfrRepository.findAllByIdsAndProjectIdAndState(nonFunctionalRequirementIds,projectId, RequirementState.DEACTIVATED).forEach(nonFunctionalRequirement -> {
            nfrRepository.findAllDescendantsOf(nonFunctionalRequirement.getId())
                    .forEach(child -> {
                        child.setState(RequirementState.REMOVED);
                        child.notifyObservers();
                        Associations.unlinkObservers(child);
                        Associations.unlinkChildren(child);
                    });
            nonFunctionalRequirement.setState(RequirementState.REMOVED);
            nonFunctionalRequirement.notifyObservers();
            Associations.unlinkObservers(nonFunctionalRequirement);
            Associations.unlinkChildren(nonFunctionalRequirement);
        });
    }
    @Transactional
    public void deleteNonFunctionalRequirements(String oryId, Long projectId, List<Long> nonFunctionalRequirementIds) {
        checkProjectManagerPermission(oryId,String.valueOf(projectId));
        if (!nfrRepository.allNonFunctionalRequirementsBelongToProject(projectId,nonFunctionalRequirementIds)){
            throw new EntityNotFoundException("One of the elements was not found on the system");
        }
        nfrRepository.deleteRemovedByIdsAndProjectId(nonFunctionalRequirementIds,projectId);
    }
}