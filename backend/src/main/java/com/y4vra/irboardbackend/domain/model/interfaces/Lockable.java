package com.y4vra.irboardbackend.domain.model.interfaces;

import com.y4vra.irboardbackend.domain.model.EntityLock;

public interface Lockable {
    Long getId();
    void setLockBounds(EntityLock lock);
}

