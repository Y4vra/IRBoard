package com.y4vra.irboardbackend.application.dtos;

import java.io.Serializable;

public record StakeholderDTO (
     Long id,
     String name,
     String description,
     long projectId
) implements Serializable {}