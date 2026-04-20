package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.FunctionalRequirementDTO;
import com.y4vra.irboardbackend.application.mappers.FunctionalRequirementMapper;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.model.FunctionalRequirement;
import com.y4vra.irboardbackend.domain.repositories.FunctionalRequirementRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FunctionalRequirementService {

    private final FunctionalRequirementRepository frRepository;
    private final FunctionalRequirementMapper frMapper;
    private final PermissionService permService;

    public FunctionalRequirementService(FunctionalRequirementRepository frRepository,
                                        FunctionalRequirementMapper frMapper,
                                        PermissionService permService) {
        this.frRepository = frRepository;
        this.frMapper = frMapper;
        this.permService = permService;
    }

    @Transactional(readOnly = true)
    public List<FunctionalRequirementDTO> findFunctionalRequirementsOfFunctionality(String oryId, Long functionalityId) {
        boolean hasAccess = permService.checkPermission("Functionality", String.valueOf(functionalityId), "view", oryId);

        if (!hasAccess) {
            throw new AccessDeniedException("User not authorized to view functional requirements of this functionality");
        }

        return frRepository.findAllByFunctionalityId(functionalityId).stream()
                .map(frMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public FunctionalRequirementDTO createFunctionalRequirement(FunctionalRequirementDTO dto, String oryId) {
        boolean canCreate = permService.checkPermission("Functionality", String.valueOf(dto.functionalityId()), "edit", oryId);

        if (!canCreate) {
            throw new AccessDeniedException("User not authorized to create requirements in this functionality");
        }

        FunctionalRequirement fr = frMapper.toEntity(dto);
        FunctionalRequirement saved = frRepository.save(fr);

        return frMapper.toDto(saved);
    }
}