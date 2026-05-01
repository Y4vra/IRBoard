package com.y4vra.irboardbackend.domain.model;

import com.y4vra.irboardbackend.domain.model.interfaces.ProjectElement;
import jakarta.persistence.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "entity_lock")
public class EntityLock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String entityType; // e.g. "Project", "User"

    @Column(nullable = false)
    private Long entityId;

    @Column(nullable = false)
    private LocalDateTime lockedAt;

    private Long projectId;
    private boolean systemWide;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }

    public LocalDateTime getLockedAt() { return lockedAt; }
    public void setLockedAt(LocalDateTime lockedAt) { this.lockedAt = lockedAt; }

    public Long getProjectId() {return projectId;}
    public void setProjectId(Long projectId) {
        if (isSystemWide()) throw new IllegalStateException("A system-scoped entity cannot have a project-wide lock");
        this.projectId = projectId;
    }
    public boolean isSystemWide() { return systemWide; }
    public void setSystemWide(boolean systemWide) {
        if (this.projectId!=null) throw new IllegalStateException("A project-bound entity cannot have a system-wide lock");
        this.systemWide = systemWide;
    }
}
