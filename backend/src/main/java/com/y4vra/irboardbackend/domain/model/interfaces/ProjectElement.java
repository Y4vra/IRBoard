package com.y4vra.irboardbackend.domain.model.interfaces;

import com.y4vra.irboardbackend.domain.model.EntityLock;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;

@MappedSuperclass
public abstract class ProjectElement implements Lockable {

    @Column(name="projectElementProjectId")
    private Long projectId;

    @Override
    public void setLockBounds(EntityLock lock) {
        lock.setProjectId(projectId);
    }

    public Long getProjectId(){
        return projectId;
    }
    public void setProjectId(Long projectId){
        this.projectId = projectId;
    }
}
