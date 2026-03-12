package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.domain.model.NonFunctionalRequirement;
import com.y4vra.irboardbackend.domain.model.Requirement;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring") // "spring" permite usar @Autowired
public interface RequirementMapper {

    // Convierte de Entidad a DTO de respuesta
    @Mapping(source = "internalUniqueId", target = "id")
    @Mapping(source = "project.name", target = "projectName") // Mapeo anidado
    RequirementResponseDTO toResponseDTO(Requirement requirement);
    //TODO setup mappers, dtos and services with controllers
    NonFunctionalRequirement toEntity(RequirementRequestDTO dto);
}