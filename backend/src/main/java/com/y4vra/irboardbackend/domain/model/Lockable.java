package com.y4vra.irboardbackend.domain.model;

public interface Lockable {
    public boolean isLocked();
    public void lock(User user);
    public void unlock();
}
