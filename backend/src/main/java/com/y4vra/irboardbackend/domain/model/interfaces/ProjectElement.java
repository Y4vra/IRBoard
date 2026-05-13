package com.y4vra.irboardbackend.domain.model.interfaces;

import com.y4vra.irboardbackend.domain.model.EntityLock;
import com.y4vra.irboardbackend.domain.model.Project;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MappedSuperclass;

@MappedSuperclass
public abstract class ProjectElement implements Lockable {

    @ManyToOne()
    @JoinColumn(name = "project_id")
    protected Project project;//remove from children and do link

    @Column(name = "project_id", insertable = false, updatable = false)
    private Long projectId;

    private String entityIdentifier;

    @Override
    public void setLockBounds(EntityLock lock) {
        lock.setProjectId(projectId);
    }

    public Long getProjectId(){ return projectId; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public String getEntityIdentifier(){ return entityIdentifier; }
    public void setEntityIdentifier(String entityIdentifier){ this.entityIdentifier = entityIdentifier; }
}
