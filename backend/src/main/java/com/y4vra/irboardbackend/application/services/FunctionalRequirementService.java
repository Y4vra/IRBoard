package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.FunctionalRequirementDTO;
import com.y4vra.irboardbackend.application.dtos.FunctionalityDTO;
import com.y4vra.irboardbackend.application.mappers.FunctionalRequirementMapper;
import com.y4vra.irboardbackend.application.mappers.FunctionalityMapper;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.errors.LockableEntityException;
import com.y4vra.irboardbackend.domain.model.*;
import com.y4vra.irboardbackend.domain.model.enums.PriorityStyle;
import com.y4vra.irboardbackend.domain.model.enums.RequirementState;
import com.y4vra.irboardbackend.domain.repositories.*;
import com.y4vra.irboardbackend.domain.service.EntitySlugGenerator;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.PersistenceContext;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class FunctionalRequirementService extends RequirementService {

    private final ProjectRepository projectRepository;
    @PersistenceContext
    private EntityManager entityManager;

    private final FunctionalRequirementRepository frRepository;
    private final FunctionalRequirementMapper frMapper;
    private final FunctionalityRepository functionalityRepository;
    private final FunctionalityMapper functionalityMapper;
    private final FunctionalityService functionalityService;

    public FunctionalRequirementService(FunctionalRequirementRepository frRepository,
                                        NonFunctionalRequirementRepository nfrRepository, DocumentRepository documentRepository, StakeholderRepository stakeholderRepository, RequirementRepository requirementRepository,
                                        FunctionalRequirementMapper frMapper,
                                        FunctionalityRepository functionalityRepository,
                                        PermissionService permService, FunctionalityMapper functionalityMapper, FunctionalityService functionalityService, ProjectRepository projectRepository, EntityLockService lockService) {
        super(permService,stakeholderRepository,documentRepository,nfrRepository,requirementRepository,lockService);
        this.frRepository = frRepository;
        this.frMapper = frMapper;
        this.functionalityRepository = functionalityRepository;
        this.functionalityMapper = functionalityMapper;
        this.functionalityService = functionalityService;
        this.projectRepository = projectRepository;
    }

    private void checkEditPermission(String oryId,String parentId){
        if (!permService.checkPermission("Functionality", String.valueOf(parentId), "editRequirements", oryId)){
            throw new AccessDeniedException("User not authorized to edit requirements in this functionality");
        }
    }
    private void checkViewPermission(String oryId,String parentId){
        if (!permService.checkPermission("Functionality", String.valueOf(parentId), "viewRequirements", oryId)){
            throw new AccessDeniedException("User not authorized to view requirements in this functionality");
        }
    }

    @Transactional(readOnly = true)
    public List<FunctionalRequirementDTO> findFunctionalRequirementsOfFunctionality(String oryId, Long functionalityId) {
        checkViewPermission(oryId,String.valueOf(functionalityId));
        return frRepository.findAllByFunctionalityId(functionalityId).stream()
                .map(frMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public FunctionalRequirementDTO createFunctionalRequirement(String oryId,FunctionalRequirementDTO dto, Long projectId, Long functionalityId) {
        checkEditPermission(oryId,String.valueOf(functionalityId));
        Project project = projectRepository.findById(projectId).orElseThrow(()->new EntityNotFoundException("Project does not exist"));
        Functionality functionality = functionalityRepository.findById(functionalityId).orElseThrow(()->new EntityNotFoundException("Functionality does not exist"));

        FunctionalRequirement fr = frMapper.toEntity(dto,functionality);
        Associations.link(project,fr);
        Associations.link(functionality, fr);
        EntitySlugGenerator.setSlug(fr,projectId);
        fr.setState(RequirementState.PENDING_APPROVAL);
        if (dto.parentId() != null) {
            FunctionalRequirement frParent = frRepository.findById(dto.parentId())
                    .orElseThrow(() -> new EntityNotFoundException("Parent not found"));

            Long parentFunctionalityId = frRepository.findRootFunctionalityIdById(dto.parentId())
                    .orElseThrow(() -> new EntityNotFoundException("Parent functionality not found"));

            if (!parentFunctionalityId.equals(functionalityId)) {
                throw new IllegalArgumentException("Parent does not belong to this functionality");
            }

            Associations.link(frParent, fr);
        }
        FunctionalRequirement saved = frRepository.save(fr);

        return frMapper.toDto(saved);
    }
    @Transactional(readOnly = true)
    public FunctionalRequirementDTO findFunctionalRequirementById(String oryId, long functionalityId, long functionalRequirementId) {
        checkViewPermission(oryId,String.valueOf(functionalityId));

        FunctionalRequirement functionalRequirement = frRepository.findById(functionalRequirementId).orElseThrow(()-> new EntityNotFoundException("FunctionalRequirement with id " + functionalRequirementId + " not found"));
        if(functionalRequirement.getFunctionality().getId() != functionalityId){
            throw new EntityNotFoundException("FunctionalRequirement with id " + functionalRequirementId + " not found");
        }
        return frMapper.toDetailedDto(functionalRequirement,
                stakeholderRepository.findAllObservedByRequirement(functionalRequirementId),
                nfrRepository.findAllObservedByRequirement(functionalRequirementId),
                documentRepository.findAllObservedByRequirement(functionalRequirementId),
                frRepository.findAllObservedByRequirement(functionalRequirementId));
    }

    @Transactional
    public void updatePriority(FunctionalRequirement fr, String priority) {
        Functionality functionality = functionalityRepository.findById(fr.getFunctionality().getId())
                .orElseThrow(() -> new EntityNotFoundException("Functionality not found"));

        if (!isValidPriority(priority, functionality.getProject().getPriorityStyle())) {
            throw new IllegalArgumentException("Invalid priority: " + priority);
        }
        fr.setPriority(priority);
    }

    private boolean isValidPriority(String priority, PriorityStyle style) {
        if (priority == null || priority.isBlank()) return false;
        return switch (style) {
            case TERNARY -> Set.of("HIGH", "NORMAL", "LOW").contains(priority);
            case MOSCOW -> Set.of("MUST", "SHOULD", "COULD", "WONT").contains(priority);
            default -> false;
        };
    }

    // linking & unlinking
    // linking
    @Transactional
    public void observeStakeholder(String oryId,Long projectId, Long functionalityId,Long requirementId, Long stakeholderId) {
        checkEditPermission(oryId,String.valueOf(functionalityId));
        Associations.observe(frRepository.findById(requirementId).orElseThrow(() -> new EntityNotFoundException("Could not find functional requirement")),
                            stakeholderRepository.findByIdAndProjectId(stakeholderId,projectId).orElseThrow(()-> new EntityNotFoundException("Could not find stakeholder")));
    }
    @Transactional
    public void observeDocument(String oryId,Long projectId, Long functionalityId,Long requirementId, Long documentId) {
        checkEditPermission(oryId,String.valueOf(functionalityId));
        Associations.observe(frRepository.findById(requirementId).orElseThrow(() -> new EntityNotFoundException("Could not find functional requirement")),
                documentRepository.findByIdAndProjectId(documentId,projectId).orElseThrow(()-> new EntityNotFoundException("Could not find document")));
    }
    @Transactional
    public void observeRequirement(String oryId, Long functionalityId,Long requirementId, Long requirementId2) {
        checkEditPermission(oryId,String.valueOf(functionalityId));
        Associations.observe(frRepository.findById(requirementId).orElseThrow(() -> new EntityNotFoundException("Could not find functional requirement")),
                requirementRepository.findById(requirementId2).orElseThrow(() -> new EntityNotFoundException("Could not find requirement")));
    }
    @Transactional
    public void unobserveStakeholder(String oryId,Long projectId, Long functionalityId,Long requirementId, Long stakeholderId) {
        checkEditPermission(oryId,String.valueOf(functionalityId));
        Associations.unobserve(frRepository.findById(requirementId).orElseThrow(() -> new EntityNotFoundException("Could not find functional requirement")),
                stakeholderRepository.findByIdAndProjectId(stakeholderId,projectId).orElseThrow(()-> new EntityNotFoundException("Could not find stakeholder")));
    }
    @Transactional
    public void unobserveDocument(String oryId,Long projectId, Long functionalityId,Long requirementId, Long documentId) {
        checkEditPermission(oryId,String.valueOf(functionalityId));
        Associations.unobserve(frRepository.findById(requirementId).orElseThrow(() -> new EntityNotFoundException("Could not find functional requirement")),
                documentRepository.findByIdAndProjectId(documentId,projectId).orElseThrow(()-> new EntityNotFoundException("Could not find document")));
    }
    @Transactional
    public void unobserveRequirement(String oryId, Long functionalityId,Long requirementId, Long requirementId2) {
        checkEditPermission(oryId,String.valueOf(functionalityId));
        Associations.unobserve(frRepository.findById(requirementId).orElseThrow(() -> new EntityNotFoundException("Could not find functional requirement")),
                requirementRepository.findById(requirementId2).orElseThrow(() -> new EntityNotFoundException("Could not find requirement")));
    }

    @Transactional
    public List<FunctionalityDTO> findObservableFRequirementsGroupedByFunctionality(
            String oryId, Long projectId, Long requirementId) {

        Set<Long> viewableIds = functionalityService.getViewableFunctionalityIds(oryId, projectId);

        List<Functionality> functionalities = functionalityRepository.findByProjectId(projectId)
                .stream()
                .filter(f -> viewableIds.contains(f.getId()))
                .toList();

        Map<Long, List<FunctionalRequirementDTO>> requirementsByFunctionality = functionalities.stream()
                .collect(Collectors.toMap(
                        Functionality::getId,
                        f -> frRepository
                                .findObservableFRequirementsForRequirementAndFunctionality(
                                        projectId, f.getId(), requirementId)
                                .stream()
                                .map(frMapper::toDto)
                                .toList()
                ));

        return functionalityMapper.toDtoListWithRequirements(functionalities, requirementsByFunctionality);
    }

    @Transactional
    public void reorderRequirement(String oryId, Long functionalityId, Long functionalRequirementId, Long orderValue) {
        checkEditPermission(oryId,String.valueOf(functionalityId));
        functionalityRepository.findById(functionalityId).orElseThrow(()-> new EntityNotFoundException("Could not find functionality"));
        FunctionalRequirement fr = frRepository.findById(functionalRequirementId).orElseThrow(()-> new EntityNotFoundException("Could not find functional requirement"));
        if(!Objects.equals(fr.getFunctionality().getId(), functionalityId)){
            throw new EntityNotFoundException("Functionality id does not match functionality id");
        }
        fr.setOrderValue(orderValue);
    }
    @Transactional
    public void changeParent(String oryId, Long functionalityId, Long functionalRequirementId, Long newParentId) {
        checkEditPermission(oryId,String.valueOf(functionalityId));
        functionalityRepository.findById(functionalityId)
                .orElseThrow(() -> new EntityNotFoundException("Could not find functionality"));
        FunctionalRequirement fr = frRepository.findByIdWithParent(functionalRequirementId)
                .orElseThrow(() -> new EntityNotFoundException("Could not find functional requirement"));
        if (!Objects.equals(fr.getFunctionality().getId(), functionalityId))
            throw new EntityNotFoundException("Functionality id does not match functionality id");

        if (fr.getParent() != null) {
            FunctionalRequirement currentParent = frRepository
                    .findByIdWithChildren(fr.getParent().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Could not find current parent"));
            Associations.unlink(currentParent, fr);
        }
        if (newParentId != null) {
            FunctionalRequirement newParent = frRepository.findById(newParentId)
                    .orElseThrow(() -> new EntityNotFoundException("Could not find parent"));
            if (!Objects.equals(newParent.getFunctionality().getId(), functionalityId))
                throw new EntityNotFoundException("Functionality id does not match functionality id");
            Associations.link(newParent, fr);
        }
    }

    @Transactional
    public void requestEdit(User user,Long projectId,Long functionalityId,Long requirementId) {
        checkEditPermission(user.getOryId(), String.valueOf(functionalityId));
        super.requestEdit(user,projectId,requirementId);
    }
    @Transactional
    public FunctionalRequirementDTO patch(User user, Long requirementId, FunctionalRequirementDTO patch) {
        FunctionalRequirement requirement = frRepository.findById(requirementId).orElseThrow(()->new EntityNotFoundException("Requirement not found"));
        if(!entityLockService.isLockedByUser(requirement, user)) {
            throw new LockableEntityException("You do not hold the lock for this project");
        }
        frMapper.patchEntity(patch, requirement);
        updatePriority(requirement,patch.priority());
        entityLockService.unlock(requirement,user);
        requirement.setState(RequirementState.PENDING_APPROVAL);
        requirement.notifyObservers();
        return frMapper.toDto(frRepository.save(requirement));
    }
    @Transactional
    public void approveRequirements(String oryId, Long projectId, Long functionalityId, List<Long> functionalRequirementIds) {
        if (!permService.checkPermission("Project", String.valueOf(projectId), "editProject", oryId)) {
            throw new AccessDeniedException("User not authorized to perform this action on this project");
        }
        checkEditPermission(oryId,String.valueOf(functionalityId));
        if (!frRepository.allFunctionalRequirementsBelongToFunctionalityAndProject(functionalityId,projectId,functionalRequirementIds))
            throw new EntityNotFoundException("One of the elements was not found on the system");
        frRepository.updateStateByIdsAndFunctionalityAndProject(functionalRequirementIds,functionalityId,projectId,RequirementState.APPROVED,RequirementState.PENDING_APPROVAL);
    }
}