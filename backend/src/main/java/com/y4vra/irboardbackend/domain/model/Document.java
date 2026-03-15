package com.y4vra.irboardbackend.domain.model;

import jakarta.persistence.*;

@Entity
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String fileName;

    private String mimeType;

    @Lob
    private byte[] content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    public Document() {}

    public Long getId() { return id; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }

    public byte[] getContent() { return content; }
    public void setContent(byte[] content) { this.content = content; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
}