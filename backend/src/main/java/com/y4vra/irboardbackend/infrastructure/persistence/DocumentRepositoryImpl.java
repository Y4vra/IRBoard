package com.y4vra.irboardbackend.infrastructure.persistence;

import com.y4vra.irboardbackend.domain.model.Document;
import com.y4vra.irboardbackend.domain.model.Stakeholder;
import com.y4vra.irboardbackend.domain.repositories.DocumentRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
interface JpaDocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findAllByProjectId(Long projectId);
    @Query("""
        SELECT d FROM Document d JOIN d.observerRequirements r WHERE r.id = :requirementId
    """)
    List<Document> findAllObservedByRequirement(Long requirementId);
    @Query("""
        SELECT d FROM Document d
        WHERE d.project.id = :projectId
        AND NOT EXISTS (
            SELECT 1 FROM d.observerRequirements r
            WHERE r.id = :requirementId
        )
    """)
    List<Document> findObservableDocumentsForRequirement(Long projectId,Long requirementId);
}

@Component
public class DocumentRepositoryImpl implements DocumentRepository {

    private final JpaDocumentRepository jpaRepository;

    public DocumentRepositoryImpl(JpaDocumentRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<Document> findAll() {
        return jpaRepository.findAll();
    }

    @Override
    public List<Document> findAllById(Iterable<Long> ids) {
        return jpaRepository.findAllById(ids);
    }

    @Override
    public List<Document> findAllByProjectId(Long projectId) {
        return jpaRepository.findAllByProjectId(projectId);
    }

    @Override
    public Optional<Document> findById(Long id) {
        return jpaRepository.findById(id);
    }

    @Override
    public Document save(Document doc) {
        return jpaRepository.save(doc);
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public List<Document> findAllObservedByRequirement(Long requirementId) {
        return jpaRepository.findAllObservedByRequirement(requirementId);
    }
    @Override
    public List<Document> findObservableDocumentsForRequirement(Long projectId,Long requirementId){
        return jpaRepository.findObservableDocumentsForRequirement(projectId,requirementId);
    }
}