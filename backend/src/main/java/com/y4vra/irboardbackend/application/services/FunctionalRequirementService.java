package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.FunctionalRequirementDTO;
import com.y4vra.irboardbackend.application.dtos.FunctionalityDTO;
import com.y4vra.irboardbackend.application.mappers.FunctionalRequirementMapper;
import com.y4vra.irboardbackend.application.mappers.FunctionalityMapper;
import com.y4vra.irboardbackend.application.ports.PermissionService;
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
                                        PermissionService permService, FunctionalityMapper functionalityMapper, FunctionalityService functionalityService, ProjectRepository projectRepository) {
        super(permService,stakeholderRepository,documentRepository,nfrRepository,requirementRepository);
        this.frRepository = frRepository;
        this.frMapper = frMapper;
        this.functionalityRepository = functionalityRepository;
        this.functionalityMapper = functionalityMapper;
        this.functionalityService = functionalityService;
        this.projectRepository = projectRepository;
    }

    @Transactional(readOnly = true)
    public List<FunctionalRequirementDTO> findFunctionalRequirementsOfFunctionality(String oryId, Long functionalityId) {
        boolean hasAccess = permService.checkPermission("Functionality", String.valueOf(functionalityId), "viewRequirements", oryId);

        if (!hasAccess) {
            throw new AccessDeniedException("User not authorized to view functional requirements of this functionality");
        }

        return frRepository.findAllByFunctionalityId(functionalityId).stream()
                .map(frMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public FunctionalRequirementDTO createFunctionalRequirement(String oryId,FunctionalRequirementDTO dto, Long projectId, Long functionalityId) {
        if (!permService.checkPermission("Functionality", String.valueOf(functionalityId), "editRequirements", oryId)){
            throw new AccessDeniedException("User not authorized to create requirements in functionality");
        }
        Project project = projectRepository.findById(projectId).orElseThrow(()->new EntityNotFoundException("Project does not exist"));
        Functionality functionality = functionalityRepository.findById(functionalityId).orElseThrow(()->new EntityNotFoundException("Functionality does not exist"));

        FunctionalRequirement fr = frMapper.toEntity(dto,functionality);
        Associations.link(project,fr);
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
        } else {
            Associations.link(functionality, fr);
        }
        FunctionalRequirement saved = frRepository.save(fr);

        return frMapper.toDto(saved);
    }
    @Transactional(readOnly = true)
    public FunctionalRequirementDTO findFunctionalRequirementById(String oryId, long functionalityId, long functionalRequirementId) {
        if (!permService.checkPermission("Functionality", String.valueOf(functionalityId), "viewRequirements", oryId)){
            throw new AccessDeniedException("User not authorized to view requirements in this functionality");
        }

        Optional<FunctionalRequirement> functionalRequirement = frRepository.findById(functionalRequirementId);
        if(functionalRequirement.isEmpty()) {
            throw new EntityNotFoundException("FunctionalRequirement with id " + functionalRequirementId + " not found");
        }
        if(functionalRequirement.get().getFunctionality().getId() != functionalityId){
            throw new EntityNotFoundException("FunctionalRequirement with id " + functionalRequirementId + " not found");
        }
        return frMapper.toDetailedDto(functionalRequirement.get(),
                stakeholderRepository.findAllObservedByRequirement(functionalRequirementId),
                nfrRepository.findAllObservedByRequirement(functionalRequirementId),
                documentRepository.findAllObservedByRequirement(functionalRequirementId),
                frRepository.findAllObservedByRequirement(functionalRequirementId));
    }

    @Transactional
    public void updatePriority(Long frId, String priority) {
        FunctionalRequirement fr = frRepository.findById(frId)
                .orElseThrow(() -> new EntityNotFoundException("FR not found"));

        Long rootFunctionalityId = frRepository.findRootFunctionalityIdById(frId)
                .orElseThrow(() -> new EntityNotFoundException("Root functionality not found"));

        Functionality functionality = functionalityRepository.findById(rootFunctionalityId)
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
    public void observeStakeholder(String oryId, Long functionalityId,Long requirementId, Long stakeholderId) {
        if (!permService.checkPermission("Functionality", String.valueOf(functionalityId), "editRequirements", oryId)){
            throw new AccessDeniedException("User not authorized to modify requirements in functionality");
        }
        Associations.observe(frRepository.findById(requirementId).orElseThrow(() -> new EntityNotFoundException("Could not find functional requirement")),
                            stakeholderRepository.findById(stakeholderId).orElseThrow(()-> new EntityNotFoundException("Could not find stakeholder")));
    }
    @Transactional
    public void observeDocument(String oryId, Long functionalityId,Long requirementId, Long documentId) {
        if (!permService.checkPermission("Functionality", String.valueOf(functionalityId), "editRequirements", oryId)){
            throw new AccessDeniedException("User not authorized to modify requirements in functionality");
        }
        Associations.observe(frRepository.findById(requirementId).orElseThrow(() -> new EntityNotFoundException("Could not find functional requirement")),
                documentRepository.findById(documentId).orElseThrow(()-> new EntityNotFoundException("Could not find document")));
    }
    @Transactional
    public void observeRequirement(String oryId, Long functionalityId,Long requirementId, Long requirementId2) {
        if (!permService.checkPermission("Functionality", String.valueOf(functionalityId), "editRequirements", oryId)){
            throw new AccessDeniedException("User not authorized to modify requirements in functionality");
        }
        Associations.observe(frRepository.findById(requirementId).orElseThrow(() -> new EntityNotFoundException("Could not find functional requirement")),
                requirementRepository.findById(requirementId2).orElseThrow(() -> new EntityNotFoundException("Could not find requirement")));
    }
    @Transactional
    public void unobserveStakeholder(String oryId, Long functionalityId,Long requirementId, Long stakeholderId) {
        if (!permService.checkPermission("Functionality", String.valueOf(functionalityId), "editRequirements", oryId)){
            throw new AccessDeniedException("User not authorized to modify requirements in functionality");
        }
        Associations.unobserve(frRepository.findById(requirementId).orElseThrow(() -> new EntityNotFoundException("Could not find functional requirement")),
                stakeholderRepository.findById(stakeholderId).orElseThrow(()-> new EntityNotFoundException("Could not find stakeholder")));
    }
    @Transactional
    public void unobserveDocument(String oryId, Long functionalityId,Long requirementId, Long documentId) {
        if (!permService.checkPermission("Functionality", String.valueOf(functionalityId), "editRequirements", oryId)){
            throw new AccessDeniedException("User not authorized to modify requirements in functionality");
        }
        Associations.unobserve(frRepository.findById(requirementId).orElseThrow(() -> new EntityNotFoundException("Could not find functional requirement")),
                documentRepository.findById(documentId).orElseThrow(()-> new EntityNotFoundException("Could not find document")));
    }
    @Transactional
    public void unobserveRequirement(String oryId, Long functionalityId,Long requirementId, Long requirementId2) {
        if (!permService.checkPermission("Functionality", String.valueOf(functionalityId), "editRequirements", oryId)){
            throw new AccessDeniedException("User not authorized to modify requirements in functionality");
        }
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
        if (!permService.checkPermission("Functionality", String.valueOf(functionalityId), "editRequirements", oryId)){
            throw new AccessDeniedException("User not authorized to modify requirements in functionality");
        }
        functionalityRepository.findById(functionalityId).orElseThrow(()-> new EntityNotFoundException("Could not find functionality"));
        FunctionalRequirement fr = frRepository.findById(functionalRequirementId).orElseThrow(()-> new EntityNotFoundException("Could not find functional requirement"));
        if(!Objects.equals(fr.getFunctionality().getId(), functionalityId)){
            throw new EntityNotFoundException("Functionality id does not match functionality id");
        }
        fr.setOrderValue(orderValue);
    }
    @Transactional
    public void changeParent(String oryId, Long functionalityId, Long functionalRequirementId, Long newParentId) {
        if (!permService.checkPermission("Functionality", String.valueOf(functionalityId), "editRequirements", oryId)){
            throw new AccessDeniedException("User not authorized to modify requirements in functionality");
        }
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
}