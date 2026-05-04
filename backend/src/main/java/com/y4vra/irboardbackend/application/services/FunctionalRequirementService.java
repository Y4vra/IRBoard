package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.FunctionalRequirementDTO;
import com.y4vra.irboardbackend.application.mappers.FunctionalRequirementMapper;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.model.Associations;
import com.y4vra.irboardbackend.domain.model.FunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.Functionality;
import com.y4vra.irboardbackend.domain.model.enums.PriorityStyle;
import com.y4vra.irboardbackend.domain.model.enums.RequirementState;
import com.y4vra.irboardbackend.domain.repositories.FunctionalRequirementRepository;
import com.y4vra.irboardbackend.domain.repositories.FunctionalityRepository;
import com.y4vra.irboardbackend.domain.service.EntitySlugGenerator;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class FunctionalRequirementService extends RequirementService {

    private final FunctionalRequirementRepository frRepository;
    private final FunctionalRequirementMapper frMapper;
    private final FunctionalityRepository fRepo;
    private final PermissionService permService;

    public FunctionalRequirementService(FunctionalRequirementRepository frRepository,
                                        FunctionalRequirementMapper frMapper,
                                        FunctionalityRepository fRepo,
                                        PermissionService permService) {
        this.frRepository = frRepository;
        this.frMapper = frMapper;
        this.fRepo = fRepo;
        this.permService = permService;
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
    public FunctionalRequirementDTO createFunctionalRequirement(String oryId,FunctionalRequirementDTO dto, Long functionalityId) {
        if (!permService.checkPermission("Functionality", String.valueOf(functionalityId), "editRequirements", oryId)){
            throw new AccessDeniedException("User not authorized to create requirements in functionality");
        }
        Optional<Functionality> functionality = fRepo.findById(functionalityId);
        if (functionality.isEmpty()) {
            throw new IllegalArgumentException("Functionality does not exist");
        }

        Functionality f = functionality.get();
        FunctionalRequirement fr = frMapper.toEntity(dto,f);
        fr.setProjectId(f.getProjectId());
        EntitySlugGenerator.setSlug(fr,f.getProjectId());
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
            Associations.link(functionality.get(), fr);
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
        return frMapper.toDto(functionalRequirement.get());
    }

    @Transactional
    public void updatePriority(Long frId, String priority) {
        FunctionalRequirement fr = frRepository.findById(frId)
                .orElseThrow(() -> new EntityNotFoundException("FR not found"));

        Long rootFunctionalityId = frRepository.findRootFunctionalityIdById(frId)
                .orElseThrow(() -> new EntityNotFoundException("Root functionality not found"));

        Functionality functionality = fRepo.findById(rootFunctionalityId)
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
}