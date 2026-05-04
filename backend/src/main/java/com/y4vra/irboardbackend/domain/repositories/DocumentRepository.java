package com.y4vra.irboardbackend.domain.repositories;

import com.y4vra.irboardbackend.domain.model.Document;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository {
    List<Document> findAll();
    List<Document> findAllById(Iterable<Long> ids);
    List<Document> findAllByProjectId(Long projectId);
    Optional<Document> findById(Long id);
    Document save(Document doc);
    void deleteById(Long id);

    List<Document> findAllObservedByRequirement(Long requirementId);
    List<Document> findObservableDocumentsForRequirement(Long projectId,Long requirementId);
}
