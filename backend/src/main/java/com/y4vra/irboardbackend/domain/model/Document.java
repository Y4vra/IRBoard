package com.y4vra.irboardbackend.domain.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Document {

    @Id
    @GeneratedValue
    private long id;
    @Column(unique=true)
    private String fileName;
    private String mimeType;

    @Lob
    @Column(columnDefinition = "BYTEA")
    private byte[] content;

    @ManyToOne
    private Project project;


}
