package com.y4vra.irboardbackend.application.dtos;

import com.y4vra.irboardbackend.domain.model.Project;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class FunctionalityDTO implements Serializable {
    private Long id;
    private String name;
    private String label;
    private String state;
    private long projectId;
}