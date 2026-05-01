package com.y4vra.irboardbackend.domain.model.interfaces;

import com.y4vra.irboardbackend.domain.model.EntityLock;

public abstract class ProjectIndependentElement implements Lockable{
    // lockable entities that are outside the scope of a specific project, system-wide

    public void setLockBounds(EntityLock lock) {
        lock.setSystemWide(true);
    }
}
