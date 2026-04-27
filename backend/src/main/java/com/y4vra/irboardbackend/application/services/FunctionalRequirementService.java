package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.FunctionalRequirementDTO;
import com.y4vra.irboardbackend.application.dtos.NonFunctionalRequirementDTO;
import com.y4vra.irboardbackend.application.mappers.FunctionalRequirementMapper;
import com.y4vra.irboardbackend.application.mappers.FunctionalityMapper;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.model.FunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.Functionality;
import com.y4vra.irboardbackend.domain.model.NonFunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.enums.RequirementState;
import com.y4vra.irboardbackend.domain.repositories.FunctionalRequirementRepository;
import com.y4vra.irboardbackend.domain.repositories.FunctionalityRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FunctionalRequirementService {

    private final FunctionalRequirementRepository frRepository;
    private final FunctionalRequirementMapper frMapper;
    private final FunctionalityRepository fRepo;
    private final FunctionalityMapper fMapper;
    private final PermissionService permService;

    public FunctionalRequirementService(FunctionalRequirementRepository frRepository,
                                        FunctionalRequirementMapper frMapper,
                                        FunctionalityRepository fRepo,
                                        FunctionalityMapper fMapper,
                                        PermissionService permService) {
        this.frRepository = frRepository;
        this.frMapper = frMapper;
        this.fRepo = fRepo;
        this.fMapper = fMapper;
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
        if (permService.checkPermission("Functionality", String.valueOf(functionalityId), "editRequirements", oryId)){
            throw new AccessDeniedException("User not authorized to create requirements in this functionality");
        }
        Optional<Functionality> functionality = fRepo.findById(functionalityId);
        if (functionality.isEmpty()) {
            throw new IllegalArgumentException("Functionality does not exist");
        }

        FunctionalRequirement fr = frMapper.toEntity(dto,functionality.get());
        fr.setState(RequirementState.PENDING_APPROVAL);
        FunctionalRequirement saved = frRepository.save(fr);

        return frMapper.toDto(saved);
    }
    @Transactional(readOnly = true)
    public FunctionalRequirementDTO findFunctionalRequirementById(String oryId, long functionalityId, long functionalRequirementId) {
        if (permService.checkPermission("Functionality", String.valueOf(functionalityId), "viewRequirements", oryId)){
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
}