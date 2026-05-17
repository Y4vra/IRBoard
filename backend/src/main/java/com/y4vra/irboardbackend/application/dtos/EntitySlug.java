package com.y4vra.irboardbackend.application.dtos;

import com.y4vra.irboardbackend.domain.model.enums.EntitySlugType;

import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public record EntitySlug(
        Long projectId,
        EntitySlugType type,       // "FR" | "NFR" | "STKH" | "FUNC" | "DOC"
        String suffix      // timestamp-uuid part
) {
    private static final Pattern SLUG_PATTERN =
            Pattern.compile("^(\\d+)-(FR|NFR|STKH|FUNC|DOC)-(.+)$", Pattern.CASE_INSENSITIVE);

    public static Optional<EntitySlug> parse(String raw) {
        if (raw == null) return Optional.empty();
        Matcher m = SLUG_PATTERN.matcher(raw.trim());
        if (!m.matches()) return Optional.empty();
        try{
            return Optional.of(new EntitySlug(
                    Long.valueOf(m.group(1)),
                    EntitySlugType.fromSegment(m.group(2)),
                    m.group(3)
            ));
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    public String fullSlug() {
        return projectId + "-" + type.name() + "-" + suffix;
    }
}