package com.y4vra.irboardbackend.domain.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

import java.util.UUID;

@Entity
public class Stakeholder {
    @Id
    @GeneratedValue
    private UUID id;
    private String name;
    private String description;

    @ManyToOne
    private Project project;
}
