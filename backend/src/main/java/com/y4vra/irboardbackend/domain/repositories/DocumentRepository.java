package com.y4vra.irboardbackend.domain.repositories;

import com.y4vra.irboardbackend.domain.model.Document;
import com.y4vra.irboardbackend.domain.model.Requirement;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface DocumentRepository {
    List<Document> findAll();
    List<Document> findAllById(Iterable<Long> ids);
    List<Document> findAllByProjectId(Long projectId);
    Optional<Document> findById(Long id);
    Document save(Document doc);
    void deleteById(Long id);

    List<Document> findAllObservedByRequirement(Long requirementId);
    List<Document> findObservableDocumentsForRequirement(Long projectId,Long requirementId);

    List<Requirement> findFilteredRequirementsForDocument(Long documentId, Set<Long> viewableFunctionalities);
}
