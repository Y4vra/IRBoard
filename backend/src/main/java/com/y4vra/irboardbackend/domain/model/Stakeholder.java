package com.y4vra.irboardbackend.domain.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Data
@Entity
public class Stakeholder {
    @Id
    @GeneratedValue
    private long id;
    private String name;
    private String description;

    @ManyToOne
    private Project project;
}
