package com.y4vra.irboardbackend.application.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDTO implements Serializable {
    private Long id;
    private String name;
    private String description;
    private String state;
    private int requirementCount;
}