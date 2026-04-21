package com.y4vra.irboardbackend.application.ports;

import java.util.List;

public interface PermissionService {
    boolean checkPermission(String resourceType, String resourceId, String action, String subjectId);
    List<String> getAuthorizedObjects(String subjectId, String resourceType, String action);
    void grantPermission(String resourceType, String resourceId, String action, String subjectId);
    void grantPermissionToSubjectSet(String namespace, String object, String relation,
                                String subjectNamespace, String subjectObject, String subjectRelation);
}