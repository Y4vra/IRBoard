package com.y4vra.irboardbackend.application.dtos;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDTO implements Serializable {
    private Long id;
    private String name;
    private String description;
    private String state;
    private int requirementCount;
}