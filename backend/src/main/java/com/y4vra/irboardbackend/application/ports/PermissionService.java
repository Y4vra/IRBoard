package com.y4vra.irboardbackend.application.ports;

import java.util.List;

public interface PermissionService {
    boolean checkPermission(String resourceType, String resourceId, String action, String subjectId);
    List<String> getAuthorizedObjects(String subjectId, String resourceType, String action);
    void grantPermission(String resourceType, String resourceId, String action, String subjectId);
    void grantPermissionToSubjectSet(String namespace, String object, String relation,
                                String subjectNamespace, String subjectObject, String subjectRelation);
    void revokePermission(String resourceType, String resourceId, String action, String subjectId);
    List<String> getSubjectsForObject(String namespace, String object, String relation);

    void removeAllTuplesForSubject(String subjectId);

    List<String> filterAuthorizedObjects(String oryId, String project, String view, List<String> allProjectIds);
}