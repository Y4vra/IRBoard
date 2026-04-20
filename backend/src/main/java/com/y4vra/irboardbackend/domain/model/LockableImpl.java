package com.y4vra.irboardbackend.domain.model;

import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MappedSuperclass;

import java.time.LocalDateTime;

@MappedSuperclass
public abstract class LockableImpl implements Lockable {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modificating_user_id")
    private User modifyingUser;
    private LocalDateTime startModificationDate;

    private static final int EXPIRATION_HOURS =24;
    @Override
    public boolean isLocked() {
        return modifyingUser != null;
    }
    @Override
    public void lock(User user) {
        LocalDateTime now = LocalDateTime.now();

        if (modifyingUser != null && startModificationDate != null) {
            if (startModificationDate.isAfter(now.minusHours(EXPIRATION_HOURS)) && !modifyingUser.equals(user)) {
                throw new IllegalStateException("Locked entity may not be relocked until it is unlocked or its modification flow expires");
            }
        }
        modifyingUser = user;
        startModificationDate = now;
    }
    @Override
    public void unlock() {
        if(modifyingUser != null || startModificationDate != null) {
            throw new IllegalStateException("Unlocked element may not be unlocked");
        }
        modifyingUser = null;
        startModificationDate = null;
    }

    public void setModifyingUser(User modificatingUser) { this.modifyingUser = modificatingUser; }
    public User getModifyingUser() { return modifyingUser; }
    public LocalDateTime getStartModificationDate() { return startModificationDate; }
    public void setStartModificationDate(LocalDateTime startModificationDate) { this.startModificationDate = startModificationDate; }
}
