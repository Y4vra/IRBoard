package com.y4vra.irboardbackend.application.services;

import com.y4vra.irboardbackend.application.ports.PermissionService;
import com.y4vra.irboardbackend.domain.repositories.DocumentRepository;
import com.y4vra.irboardbackend.domain.repositories.NonFunctionalRequirementRepository;
import com.y4vra.irboardbackend.domain.repositories.RequirementRepository;
import com.y4vra.irboardbackend.domain.repositories.StakeholderRepository;

public abstract class RequirementService {

    protected final PermissionService permService;
    protected final StakeholderRepository stakeholderRepository;
    protected final DocumentRepository documentRepository;
    protected final NonFunctionalRequirementRepository nfrRepository;
    protected final RequirementRepository requirementRepository;

    public RequirementService(PermissionService permService,StakeholderRepository stakeholderRepository,DocumentRepository documentRepository,NonFunctionalRequirementRepository nonFunctionalRequirementRepository,RequirementRepository requirementRepository) {
        this.permService = permService;
        this.stakeholderRepository = stakeholderRepository;
        this.documentRepository = documentRepository;
        this.nfrRepository = nonFunctionalRequirementRepository;
        this.requirementRepository = requirementRepository;
    }
}
