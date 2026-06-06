package com.y4vra.irboardbackend.infrastructure.api.rest;

import com.y4vra.irboardbackend.application.mappers.*;
import com.y4vra.irboardbackend.domain.model.*;
import com.y4vra.irboardbackend.domain.model.enums.*;
import com.y4vra.irboardbackend.domain.repositories.*;
import com.y4vra.irboardbackend.infrastructure.clients.KetoClient;
import com.y4vra.irboardbackend.infrastructure.clients.MinioObjectStorageClient;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.client.RestClient;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public abstract class IrBoardBaseTest {


    // ── mocked external services ─────────────────────────────────────────────
    @MockitoBean
    protected KetoClient ketoClient;

    @MockitoBean
    protected io.minio.MinioClient minioClient;

    @MockitoBean
    protected MinioObjectStorageClient minioService;

    // ── real beans ───────────────────────────────────────────────────────────
    @LocalServerPort
    int port;

    RestClient client;

    @Autowired
    ProjectRepository projectRepository;
    @Autowired
    FunctionalityRepository functionalityRepository;
    @Autowired
    StakeholderRepository stakeholderRepository;
    @Autowired
    NonFunctionalRequirementRepository nfrRepository;
    @Autowired
    FunctionalRequirementRepository frRepository;
    @Autowired
    DocumentRepository documentRepository;
    @Autowired
    UserRepository userRepository;

    @Autowired
    ProjectMapper projectMapper;
    @Autowired
    FunctionalityMapper functionalityMapper;
    @Autowired
    StakeholderMapper stakeholderMapper;
    @Autowired
    NonFunctionalRequirementMapper nfrMapper;
    @Autowired
    FunctionalRequirementMapper frMapper;
    @Autowired
    DocumentMapper documentMapper;
    @Autowired
    UserMapper userMapper;

    // ── fixtures ─────────────────────────────────────────────────────────────
    protected static final String SYSTEM_ADMIN_1_ORY_ID = "ory-admin-001";
    protected static final String PROJECT_MANAGER_1_ORY_ID = "ory-manager-001";
    protected static final String PROJECT_MANAGER_2_ORY_ID = "ory-manager-002";
    protected static final String REQUIREMENT_ENGINEER_1_ORY_ID  = "ory-engineer-001";
    protected static final String STAKEHOLDER_1_ORY_ID  = "ory-stakeholder-001";

    protected Project activeProject;

    // ────────────────────────────────────────────────────────────────────────
    // Setup / teardown
    // ────────────────────────────────────────────────────────────────────────

    @BeforeEach
    void testSetup() {
        client = RestClient.builder()
                .baseUrl("http://localhost:" + port)
                .build();

        when(ketoClient.checkPermission(any(), any(), any(), any())).thenReturn(false);
        doNothing().when(ketoClient).grantPermission(any(), any(), any(), any());
        doNothing().when(ketoClient).grantPermissionToSubjectSet(any(), any(), any(), any(), any(), any());
        doNothing().when(ketoClient).revokePermission(any(), any(), any(), any());
        doNothing().when(ketoClient).removeAllTuplesForSubject(any());
        when(minioService.getDownloadUrl(anyString()))
                .thenAnswer(inv -> "https://minio.test/" + inv.getArgument(0));

        // Clean slate — RANDOM_PORT means no @Transactional rollback
        documentRepository.deleteAll();
        nfrRepository.deleteAll();
        stakeholderRepository.deleteAll();
        functionalityRepository.deleteAll();
        projectRepository.deleteAll();
        userRepository.deleteAll();

        // Seed users — the filter looks these up by oryId
        userRepository.save(buildUser(SYSTEM_ADMIN_1_ORY_ID));
        setSystemAdmin(SYSTEM_ADMIN_1_ORY_ID, true);

        userRepository.save(buildUser(PROJECT_MANAGER_1_ORY_ID));
        userRepository.save(buildUser(PROJECT_MANAGER_2_ORY_ID));
        userRepository.save(buildUser(REQUIREMENT_ENGINEER_1_ORY_ID));
        userRepository.save(buildUser(STAKEHOLDER_1_ORY_ID));

        // Seed projects
        activeProject   = projectRepository.save(buildProject("Alpha", ProjectState.ACTIVE));

        setUp();
    }

    abstract void setUp();

    // ════════════════════════════════════════════════════════════════════════
    // Helpers — auth
    // ════════════════════════════════════════════════════════════════════════

    /** Makes a user an admin by stubbing the filter's Keto admin check. */
    protected void setSystemAdmin(String oryId, Boolean isAdmin) {
        when(ketoClient.checkPermission("System", "main", "admins", oryId)).thenReturn(isAdmin);
    }

    /** Stubs Keto 'view' permission on a project for a given user. */
    protected void allowView(String oryId, Long projectId) {
        when(ketoClient.checkPermission("Project", String.valueOf(projectId), "view", oryId))
                .thenReturn(true);
    }

    /** Stubs Keto 'edit' permission on a project for a given user. */
    protected void allowEdit(String oryId, Long projectId) {
        when(ketoClient.checkPermission("Project", String.valueOf(projectId), "edit", oryId))
                .thenReturn(true);
    }

    /** Stubs Keto 'editProject' (manager-level) permission for a given user. */
    protected void allowEditProject(String oryId, Long projectId) {
        when(ketoClient.checkPermission("Project", String.valueOf(projectId), "editProject", oryId))
                .thenReturn(true);
    }

    /** Stubs Keto 'viewRequirements' (functionality-level) permission for a given user. */
    protected void allowViewRequirementsOfFunctionality(String oryId, Long functionalityId) {
        when(ketoClient.checkPermission("Functionality", String.valueOf(functionalityId), "viewRequirements", oryId))
                .thenReturn(true);
    }

    /** Stubs Keto 'editRequirements' (functionality-level) permission for a given user. */
    protected void allowEditRequirementsOfFunctionality(String oryId, Long functionalityId) {
        when(ketoClient.checkPermission("Functionality", String.valueOf(functionalityId), "editRequirements", oryId))
                .thenReturn(true);
    }

    // ── Helpers — request builders ───────────────────────────────────────────

    protected <T> ResponseEntity<T> get(String oryId, String uri, Class<T> type, Object... vars) {
        return client.get()
                .uri(uri, vars)
                .header("X-User", oryId)
                .retrieve()
                .onStatus(status -> status.isError(), (req, res) -> {})
                .toEntity(type);
    }
    protected <T> ResponseEntity<T> get(String oryId, String uri, ParameterizedTypeReference<T> type, Object... vars) {
        return client.get()
                .uri(uri, vars)
                .header("X-User", oryId)
                .retrieve()
                .onStatus(status -> status.isError(), (req, res) -> {})
                .toEntity(type);
    }

    protected <T> ResponseEntity<T> post(String oryId, String uri, Object body, Class<T> type, Object... vars) {
        return client.post()
                .uri(uri, vars)
                .header("X-User", oryId)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .toEntity(type);
    }
    protected <T> ResponseEntity<T> post(String oryId, String uri, Object body, ParameterizedTypeReference<T> type, Object... vars) {
        return client.post()
                .uri(uri, vars)
                .header("X-User", oryId)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .toEntity(type);
    }

    protected <T> ResponseEntity<T> patch(String oryId, String uri, Object body, Class<T> type, Object... vars) {
        return client.patch()
                .uri(uri, vars)
                .header("X-User", oryId)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .toEntity(type);
    }
    protected <T> ResponseEntity<T> patch(String oryId, String uri, Object body, ParameterizedTypeReference<T> type, Object... vars) {
        return client.patch()
                .uri(uri, vars)
                .header("X-User", oryId)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .toEntity(type);
    }

    protected <T> ResponseEntity<T> delete(String oryId, String uri, Class<T> type, Object... vars) {
        return client.delete()
                .uri(uri, vars)
                .header("X-User", oryId)
                .retrieve()
                .toEntity(type);
    }
    protected <T> ResponseEntity<T> delete(String oryId, String uri, ParameterizedTypeReference<T> type, Object... vars) {
        return client.delete()
                .uri(uri, vars)
                .header("X-User", oryId)
                .retrieve()
                .toEntity(type);
    }

    // ── Helpers — entity builders ────────────────────────────────────────────

    protected User buildUser(String oryId) {
        User u = new User();
        u.setOryId(oryId);
        u.setEmail(oryId + "@test.com");
        u.setName(oryId + "-name");
        u.setSurname(oryId + "-surname");
        u.setActive(true);
        u.setIsAdmin(false);
        return u;
    }

    protected Project buildProject(String name, ProjectState state) {
        Project p = new Project();
        p.setName(name);
        p.setDescription(name + "-description");
        p.setState(state);
        p.setPriorityStyle(PriorityStyle.TERNARY);
        return p;
    }

    protected Functionality buildFunctionality(String name, FunctionalityState state, Project project) {
        Functionality f = new Functionality();
        f.setName(name);
        f.setDescription(name + " description");
        f.setLabel(name.toUpperCase());
        f.setState(state);
        Associations.link(project, f);
        return f;
    }

    protected Stakeholder buildStakeholder(String name, EntityState state, Project project) {
        Stakeholder s = new Stakeholder();
        s.setName(name);
        s.setDescription(name + " description");
        s.setState(state);
        s.setProject(project);
        Associations.link(project, s);
        return s;
    }

    protected NonFunctionalRequirement buildNfr(String name, RequirementState state, Project project, ComparisonOperator operator,
                                                double threshold, double target, double actual) {
        NonFunctionalRequirement nfr = new NonFunctionalRequirement();
        nfr.setName(name);
        nfr.setDescription(name + " description");
        nfr.setState(state);
        nfr.setProject(project);
        nfr.setMeasurementUnit("ms");
        nfr.setOperator(operator);
        nfr.setThresholdValue(threshold);
        nfr.setTargetValue(target);
        nfr.setActualValue(actual);
        Associations.link(project, nfr);
        return nfr;
    }

    protected FunctionalRequirement buildFr(String name, RequirementState state, Project project, Functionality functionality) {
        FunctionalRequirement fr = new FunctionalRequirement();
        fr.setName(name);
        fr.setDescription(name + " description");
        fr.setState(state);
        fr.setProject(project);
        fr.setFunctionality(functionality);
        fr.setPriority("HIGH");
        fr.setStability("STABLE");
        Associations.link(functionality, fr);
        Associations.link(project, fr);
        return fr;
    }

    protected Document buildDocument(String name, String s3Key, EntityState state, Project project) {
        Document d = new Document();
        d.setFileName(name);
        d.setMimeType("application/pdf");
        d.setS3Key(s3Key);
        d.setFileSize(1024L);
        d.setState(state);
        d.setProject(project);
        Associations.link(project, d);
        return d;
    }

}
