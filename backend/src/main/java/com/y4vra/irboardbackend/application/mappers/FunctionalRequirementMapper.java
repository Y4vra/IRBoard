package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.FunctionalRequirementDTO;
import com.y4vra.irboardbackend.domain.model.*;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
public class FunctionalRequirementMapper {

    private StakeholderMapper stakeholderMapper;
    private DocumentMapper documentMapper;
    private NonFunctionalRequirementMapper nonFunctionalRequirementMapper;

    public FunctionalRequirementMapper(StakeholderMapper stakeholderMapper,DocumentMapper documentMapper,NonFunctionalRequirementMapper nonFunctionalRequirementMapper) {
        this.stakeholderMapper = stakeholderMapper;
        this.documentMapper = documentMapper;
        this.nonFunctionalRequirementMapper = nonFunctionalRequirementMapper;
    }

    public FunctionalRequirementDTO toDto(FunctionalRequirement entity) {
        List emptyList = List.of();
        return toDetailedDto(entity,emptyList,emptyList,emptyList,emptyList);
    }
    public FunctionalRequirementDTO toDetailedDto(FunctionalRequirement entity, List<Stakeholder> stkhs, List<NonFunctionalRequirement> nfrs, List<Document> docs, List<FunctionalRequirement> frs) {
        if (entity == null) return null;

        Long functionalityId = null;

        if (entity.getFunctionality() != null) {
            functionalityId = entity.getFunctionality().getId();
        }

        List<FunctionalRequirementDTO> childDtos = entity.getChildren().stream()
                .filter(child -> child instanceof FunctionalRequirement)
                .map(child -> toDto((FunctionalRequirement) child))
                .sorted(Comparator.comparing(
                        FunctionalRequirementDTO::orderValue,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .toList();

        return new FunctionalRequirementDTO(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getPriority(),
                entity.getStability(),
                functionalityId,
                entity.getParent() != null ? entity.getParent().getId() : null,
                entity.getOrderValue(),
                entity.getState().name(),
                childDtos,
                stakeholderMapper.toDtoList(stkhs),
                nonFunctionalRequirementMapper.toDtoList(nfrs),
                documentMapper.toDtoList(docs),
                toDtoList(frs)
        );
    }

    public FunctionalRequirement toEntity(FunctionalRequirementDTO dto, Functionality functionality) {
        if (dto == null) return null;

        FunctionalRequirement entity = new FunctionalRequirement();
        entity.setId(dto.id());
        entity.setName(dto.name());
        entity.setDescription(dto.description());
        entity.setFunctionality(functionality);
        entity.setPriority(dto.priority());
        entity.setStability(dto.stability());

        return entity;
    }

    public List<FunctionalRequirementDTO> toDtoList(List<FunctionalRequirement> roots) {
        return roots.stream()
                .map(this::toDto)
                .toList();
    }
}