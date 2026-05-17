package com.y4vra.irboardbackend.domain.model.enums;

public enum EntitySlugType {
    FR, NFR, STKH, FUNC, DOC;

    public static EntitySlugType fromSegment(String segment) {
        return valueOf(segment.toUpperCase());
    }
}
