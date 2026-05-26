package com.y4vra.irboardbackend.infrastructure.persistence;

import com.y4vra.irboardbackend.domain.model.Document;
import com.y4vra.irboardbackend.domain.model.Requirement;
import com.y4vra.irboardbackend.domain.model.Stakeholder;
import com.y4vra.irboardbackend.domain.model.enums.EntityState;
import com.y4vra.irboardbackend.domain.repositories.DocumentRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
interface JpaDocumentRepository extends JpaRepository<Document, Long> {
    Optional<Document> findByIdAndProjectId(Long id, Long projectId);
    List<Document> findAllByProjectIdAndState(Long projectId, EntityState state);
    List<Document> findAllByProjectIdAndStateNot(Long projectId, EntityState state);
    @Query("""
        SELECT d FROM Document d JOIN d.observerRequirements r WHERE r.id = :requirementId
    """)
    List<Document> findAllObservedByRequirement(Long requirementId);
    @Query("""
        SELECT d FROM Document d
        WHERE d.project.id = :projectId
        AND d.state NOT IN :notAllowedStates
        AND NOT EXISTS (
            SELECT 1 FROM d.observerRequirements r
            WHERE r.id = :requirementId
        )
    """)
    List<Document> findObservableDocumentsForRequirement(Long projectId,Long requirementId,List<EntityState> notAllowedStates);
    @Query("""
        SELECT r FROM Requirement r
        LEFT JOIN FETCH TREAT(r AS FunctionalRequirement).functionality
        WHERE r IN (
            SELECT r2 FROM Document d JOIN d.observerRequirements r2 WHERE d.id = :documentId
        )
        AND (
            TYPE(r) = NonFunctionalRequirement
            OR (TYPE(r) = FunctionalRequirement
                 AND TREAT(r AS FunctionalRequirement).functionality.id IN :viewableFunctionalities)
        )
    """)
    List<Requirement> findFilteredRequirementsForDocument(Long documentId, Set<Long> viewableFunctionalities);
    @Query("""
   SELECT COUNT(d) = :expectedCount
   FROM Document d
   WHERE d.project.id = :projectId
   AND d.id IN :documentIds
   """)
    boolean existsAllInProject(Long projectId,List<Long> documentIds,long expectedCount);
    @Modifying
    @Query("""
       UPDATE Document d
       SET d.state = :newState
       WHERE d.id IN :documentIds
       AND d.project.id = :projectId
       AND d.state = :oldState
       """)
    int updateStateByIdsAndProject(List<Long> documentIds, Long projectId, EntityState newState, EntityState oldState);
    @Modifying
    @Query("""
       UPDATE Document d
       SET d.state = :newState
       WHERE d.id IN :documentIds
       AND d.project.id = :projectId
       AND d.state IN :oldStates
       """)
    int updateStateByIdsAndProject(List<Long> documentIds, Long projectId, EntityState newState, List<EntityState> oldStates);

    @Query("""
        SELECT d from Document d
        WHERE d.id IN :documentIds
        AND d.project.id = :projectId
        AND d.state = :state
        """)
    List<Document> findAllByIdsAndProjectIdAndState(List<Long> documentIds, Long projectId, EntityState state);
    @Query("""
        SELECT d from Document d
        WHERE d.id IN :documentIds
        AND d.project.id = :projectId
        AND d.state IN :states
        """)
    List<Document> findAllByIdsAndProjectIdAndState(List<Long> documentIds, Long projectId, List<EntityState> states);

    void deleteByIdAndProjectIdAndState(Long documentId, Long projectId, EntityState entityState);

    @Query("""
        SELECT d.s3Key FROM Document d
        WHERE d.project.id = :projectId
        """)
    List<String> findAllObjectStorageKeysByProjectId(Long projectId);
}

@Component
public class DocumentRepositoryImpl implements DocumentRepository {

    private final JpaDocumentRepository jpaRepository;

    public DocumentRepositoryImpl(JpaDocumentRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

//    @Override
//    public List<Document> findAll() {
//        return jpaRepository.findAll();
//    }

//    @Override
//    public List<Document> findAllById(Iterable<Long> ids) {
//        return jpaRepository.findAllById(ids);
//    }

    @Override
    public List<String> findAllObjectStorageKeysByProjectId(Long projectId) {
        return jpaRepository.findAllObjectStorageKeysByProjectId(projectId);
    }

    @Override
    public List<Document> findAllByProjectIdNotRemoved(Long projectId) {
        return jpaRepository.findAllByProjectIdAndStateNot(projectId,EntityState.REMOVED);
    }
    @Override
    public List<Document> findAllByProjectIdRemoved(Long projectId) {
        return jpaRepository.findAllByProjectIdAndState(projectId,EntityState.REMOVED);
    }

    @Override
    public Optional<Document> findByIdAndProjectId(Long id,Long projectId) {
        return jpaRepository.findByIdAndProjectId(id,projectId);
    }

    @Override
    public Document save(Document doc) {
        return jpaRepository.save(doc);
    }

    @Override
    public List<Document> findAllObservedByRequirement(Long requirementId) {
        return jpaRepository.findAllObservedByRequirement(requirementId);
    }
    @Override
    public List<Document> findObservableDocumentsForRequirement(Long projectId,Long requirementId){
        return jpaRepository.findObservableDocumentsForRequirement(projectId,requirementId,List.of(EntityState.REMOVED,EntityState.DEACTIVATED));
    }

    @Override
    public List<Requirement> findFilteredRequirementsForDocument(Long documentId, Set<Long> viewableFunctionalities) {
        return jpaRepository.findFilteredRequirementsForDocument(documentId, viewableFunctionalities);
    }

    @Override
    public boolean allDocumentsBelongToProject(Long projectId, List<Long> documentIds) {
        return jpaRepository.existsAllInProject(projectId,documentIds,documentIds.size());
    }

    @Override
    public int updateStateByIdsAndProject(List<Long> documentIds, Long projectId, EntityState newState, EntityState oldState) {
        return jpaRepository.updateStateByIdsAndProject(documentIds,projectId,newState,oldState);
    }

    @Override
    public void deleteRemovedByIdAndProject(Long documentId, Long projectId) {
        jpaRepository.deleteByIdAndProjectIdAndState(documentId,projectId,EntityState.REMOVED);
    }

    @Override
    public List<Document> findAllByIdsAndProjectIdAndState(List<Long> documentIds, Long projectId, EntityState state) {
        return jpaRepository.findAllByIdsAndProjectIdAndState(documentIds,projectId,state);
    }
    @Override
    public List<Document> findAllByIdsAndProjectIdAndState(List<Long> documentIds, Long projectId, List<EntityState> states) {
        return jpaRepository.findAllByIdsAndProjectIdAndState(documentIds,projectId,states);
    }
}