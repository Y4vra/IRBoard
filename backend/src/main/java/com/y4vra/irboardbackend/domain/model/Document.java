package com.y4vra.irboardbackend.domain.model;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
public class Document {

    @Id
    @GeneratedValue
    private UUID id;
    @Column(unique=true)
    private String fileName;
    private String mimeType;

    @Lob
    @Column(columnDefinition = "BYTEA")
    private byte[] content;

    @ManyToOne
    private Project project;
}
