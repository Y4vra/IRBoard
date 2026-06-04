package com.y4vra.irboardbackend.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;

@DisplayName("EntityLock")
class EntityLockTest {

    @Test
    @DisplayName("basic getters and setters work correctly")
    void gettersAndSetters() {
        EntityLock lock = new EntityLock();
        User user = new User();

        LocalDateTime now = LocalDateTime.now();

        lock.setId(1L);
        lock.setUser(user);
        lock.setEntityType("Project");
        lock.setEntityId(99L);
        lock.setLockedAt(now);
        lock.setSystemWide(true);// to ensure it is not systemwide
        lock.setSystemWide(false);
        lock.setProjectId(10L);

        assertThat(lock.getId()).isEqualTo(1L);
        assertThat(lock.getUser()).isSameAs(user);
        assertThat(lock.getEntityType()).isEqualTo("Project");
        assertThat(lock.getEntityId()).isEqualTo(99L);
        assertThat(lock.getLockedAt()).isEqualTo(now);
        assertThat(lock.getProjectId()).isEqualTo(10L);
        assertThat(lock.isSystemWide()).isFalse();
    }

    @Test
    @DisplayName("setting projectId is allowed when not system-wide")
    void setProjectId_allowedWhenNotSystemWide() {
        EntityLock lock = new EntityLock();
        lock.setSystemWide(false);

        lock.setProjectId(123L);

        assertThat(lock.getProjectId()).isEqualTo(123L);
    }

    @Test
    @DisplayName("setting systemWide is allowed when no projectId exists")
    void setSystemWide_allowedWhenNoProject() {
        EntityLock lock = new EntityLock();

        lock.setSystemWide(true);

        assertThat(lock.isSystemWide()).isTrue();
    }

    @Test
    @DisplayName("setting systemWide throws if projectId already set")
    void setSystemWide_whenProjectExists_throws() {
        EntityLock lock = new EntityLock();
        lock.setProjectId(1L);

        assertThatThrownBy(() -> lock.setSystemWide(true))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("project-bound entity");
    }

    @Test
    @DisplayName("setting projectId throws if systemWide already enabled")
    void setProjectId_whenSystemWide_throws() {
        EntityLock lock = new EntityLock();
        lock.setSystemWide(true);

        assertThatThrownBy(() -> lock.setProjectId(5L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("system-scoped entity");
    }

    @Test
    @DisplayName("toggle behavior is consistent across valid transitions")
    void validTransitionFlow() {
        EntityLock lock = new EntityLock();

        lock.setProjectId(42L);

        assertThat(lock.getProjectId()).isEqualTo(42L);
        assertThat(lock.isSystemWide()).isFalse();
    }
}