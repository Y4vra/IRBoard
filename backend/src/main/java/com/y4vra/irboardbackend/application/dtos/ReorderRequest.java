package com.y4vra.irboardbackend.application.dtos;

public record ReorderRequest(
    Long orderValue,
    Long newParentId
) {}
