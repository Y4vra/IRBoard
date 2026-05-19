package com.y4vra.irboardbackend.domain.repositories;

import com.y4vra.irboardbackend.domain.model.Document;
import com.y4vra.irboardbackend.domain.model.Requirement;
import com.y4vra.irboardbackend.domain.model.enums.EntityState;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface DocumentRepository {
    List<Document> findAllByProjectIdNotRemoved(Long projectId);
    List<Document> findAllByProjectIdRemoved(Long projectId);
    Optional<Document> findByIdAndProjectId(Long id,Long projectId);
    Document save(Document doc);
//    void deleteById(Long id);

    List<Document> findAllObservedByRequirement(Long requirementId);
    List<Document> findObservableDocumentsForRequirement(Long projectId,Long requirementId);

    List<Requirement> findFilteredRequirementsForDocument(Long documentId, Set<Long> viewableFunctionalities);

    boolean allDocumentsBelongToProject(Long projectId, List<Long> documentIds);

    int updateStateByIdsAndProject(List<Long> documentIds, Long projectId, EntityState newState, EntityState oldState);
    int updateStateByIdsAndProject(List<Long> documentIds, Long projectId, EntityState newState, List<EntityState> oldStates);

    int deleteRemovedByIdsAndProject(List<Long> documentIds, Long projectId);

    List<Document> findAllByIdsAndProjectIdAndState(List<Long> documentIds, Long projectId, EntityState state);
    List<Document> findAllByIdsAndProjectIdAndState(List<Long> documentIds, Long projectId, List<EntityState> states);
}
