package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.dtos.FunctionalityDTO;
import com.y4vra.irboardbackend.application.mappers.FunctionalityMapper;
import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.errors.LabelConflictException;
import com.y4vra.irboardbackend.domain.model.Functionality;
import com.y4vra.irboardbackend.domain.model.Project;
import com.y4vra.irboardbackend.domain.model.enums.EntityState;
import com.y4vra.irboardbackend.domain.repositories.FunctionalityRepository;
import com.y4vra.irboardbackend.domain.repositories.ProjectRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class FunctionalityService {

    private final FunctionalityRepository functionalityRepository;
    private final ProjectRepository projectRepository;
    private final FunctionalityMapper functionalityMapper;
    private final PermissionService permService;

    public FunctionalityService(FunctionalityRepository functionalityRepository, ProjectRepository projectRepository, FunctionalityMapper functionalityMapper,PermissionService permService) {
        this.functionalityRepository = functionalityRepository;
        this.projectRepository = projectRepository;
        this.functionalityMapper = functionalityMapper;
        this.permService = permService;
    }

    @Transactional(readOnly = true)
    public Map<String, List<FunctionalityDTO>> findFunctionalitiesOfProjectForUser(String oryId, long projectId) {
        List<Functionality> allProjectFunctionalities = functionalityRepository.findByProjectId(projectId);

        boolean canEditProject = permService.checkPermission("Project", String.valueOf(projectId), "edit", oryId);
        boolean canViewProject = permService.checkPermission("Project", String.valueOf(projectId), "view", oryId);

        Map<String, List<FunctionalityDTO>> result = new HashMap<>();
        result.put("edit", new ArrayList<>());
        result.put("view", new ArrayList<>());
        result.put("none", new ArrayList<>());

        for (Functionality f : allProjectFunctionalities) {
            FunctionalityDTO dto = functionalityMapper.toDto(f);
            String fId = String.valueOf(f.getId());

            if (canEditProject || permService.checkPermission("Functionality", fId, "editRequirements", oryId)) {
                result.get("edit").add(dto);
            } else if (canViewProject || permService.checkPermission("Functionality", fId, "viewRequirements", oryId)) {
                result.get("view").add(dto);
            } else {
                result.get("none").add(dto);
            }
        }

        return result;
    }
    @Transactional(readOnly = true)
    public FunctionalityDTO findFunctionalityById(String oryId, long projectId, long functionalityId) {
        Optional<Functionality> functionality = functionalityRepository.findById(functionalityId);

        if(functionality.isEmpty()) {
            throw new EntityNotFoundException("Functionality with id " + functionalityId + " not found");
        }
        if(functionality.get().getProject().getId() != projectId){
            throw new EntityNotFoundException("Functionality with id " + functionalityId + " not found");
        }
        if (permService.checkPermission("Functionality", String.valueOf(functionalityId),"viewRequirements",oryId)==false){
            throw new AccessDeniedException("You do not have permission to view this Functionality");
        }
        return functionalityMapper.toDto(functionality.get());
    }
    @Transactional
    public FunctionalityDTO createFunctionality(FunctionalityDTO dto, long projectId, String oryId) {
        if(dto.projectId() != projectId){
            throw new IllegalArgumentException("Attempt to add a functionality to different project than the one being edited.");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        boolean isAllowed = permService.checkPermission("Project", String.valueOf(projectId), "edit", oryId);

        if (!isAllowed) {
            throw new AccessDeniedException("User not authorized to add functionalities to this project");
        }

        Functionality functionality = new Functionality();
        functionality.setProjectId(projectId);
        functionality.setEntityIdentifier(projectId+"-FUNC-"+ UUID.randomUUID().toString());
        functionality.setName(dto.name());
        functionality.setProject(project);
        functionality.setState(EntityState.ACTIVE);

        if (dto.label() != null && !dto.label().isBlank()) {
            functionality.setLabel(dto.label());
        } else {
            functionality.setLabel(generateLabel(dto.name()));
        }

        Functionality saved;
        try{
            saved= functionalityRepository.save(functionality);
        } catch (DataIntegrityViolationException e) {
            throw new LabelConflictException("A functionality with label '" + functionality.getLabel() + "' already exists in this project.",e);
        }
        permService.grantPermissionToSubjectSet("Functionality", String.valueOf(saved.getId()), "project", "Project", String.valueOf(projectId), "");
        return functionalityMapper.toDto(saved);
    }

    private String generateLabel(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Cannot generate label for empty name");
        }

        String[] words = name.trim().split("\\s+");
        StringBuilder label = new StringBuilder();

        for (String word : words) {
            if (!word.isEmpty()) {
                label.append(Character.toUpperCase(word.charAt(0)));
            }
        }

        if (words.length == 1 && name.length() >= 3) {
            return name.substring(0, 3).toUpperCase();
        }

        return label.toString();
    }
}