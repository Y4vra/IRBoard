package com.y4vra.irboardbackend.application.mappers;

import com.y4vra.irboardbackend.application.dtos.EntityLockDTO;
import com.y4vra.irboardbackend.domain.model.EntityLock;
import com.y4vra.irboardbackend.domain.model.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;

@DisplayName("EntityLockMapper")
class EntityLockMapperTest {

    private final EntityLockMapper mapper = new EntityLockMapper();

    // ── null handling ────────────────────────────────────────────────────────

    @Test
    @DisplayName("returns null when input is null")
    void returnsNull_whenInputIsNull() {
        assertThat(mapper.toDto(null)).isNull();
    }

    // ── mapping ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("maps EntityLock to DTO correctly")
    void mapsEntityLockToDto() {
        User user = new User();
        user.setName("Alice");

        EntityLock lock = new EntityLock();
        lock.setUser(user);
        lock.setEntityType("Project");
        lock.setEntityId(42L);
        lock.setLockedAt(LocalDateTime.of(2025, 1, 1, 12, 0));

        EntityLockDTO dto = mapper.toDto(lock);

        assertThat(dto).isNotNull();
        assertThat(dto.username()).isEqualTo("Alice");
        assertThat(dto.entityType()).isEqualTo("Project");
        assertThat(dto.entityId()).isEqualTo(42L);
        assertThat(dto.lockedAt()).isEqualTo(LocalDateTime.of(2025, 1, 1, 12, 0));
    }

    // ── edge cases ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("throws NullPointerException when user is null")
    void throwsWhenUserIsNull() {
        EntityLock lock = new EntityLock();
        lock.setEntityType("Project");
        lock.setEntityId(1L);
        lock.setLockedAt(LocalDateTime.now());
        lock.setUser(null);

        assertThatThrownBy(() -> mapper.toDto(lock))
                .isInstanceOf(NullPointerException.class);
    }
}