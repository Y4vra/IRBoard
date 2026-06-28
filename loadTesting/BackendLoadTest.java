package example;

import java.time.Duration;
import io.gatling.javaapi.core.*;
import io.gatling.javaapi.http.*;
import static io.gatling.javaapi.core.CoreDsl.*;
import static io.gatling.javaapi.http.HttpDsl.*;

/**
 * Realistic load test targeting 500 concurrent users.
 *
 * ── Why the previous version never reached 500 ────────────────────────────
 * Session duration was ~3–8 min, but the ramp was 10 min. By the time
 * Gatling tried to spin up VU #400, VU #1 had already finished and freed its
 * slot. In a closed model, Gatling immediately re-uses that slot — so the
 * concurrency graph looks like a plateau that never climbs past ~100–150.
 *
 * The fix has two parts:
 *  1. Shorten the ramp to 2 min — well under the minimum session length.
 *     All 500 VUs are in-flight before the first one can finish.
 *  2. Add a repeat(3) loop around the core work block so each session
 *     lasts ~15–25 min. Sessions now massively overlap during the peak phase,
 *     and the closed model keeps filling any slot that opens.
 *
 * ── Session structure ──────────────────────────────────────────────────────
 *  Login (once)
 *    └─ repeat 3 times:
 *         Create project → work inside it → delete it
 *         ≈ 5–8 min per iteration  →  total session ≈ 15–25 min
 *  Logout (once)
 *
 * ── Injection profile ──────────────────────────────────────────────────────
 *  Phase 1 –  2 min  ramp  0 → 500   (completes before first session ends)
 *  Phase 2 – 20 min  hold  500        (stability at full concurrency)
 *  Phase 3 –  3 min  drain 500 → 0   (graceful wind-down)
 *
 * ── Think-time rationale ───────────────────────────────────────────────────
 *  Auth / nav  :  0.5 – 1.5 s  (browser-automated)
 *  Dashboard   :  3   – 6   s  (user reads after login)
 *  Form fills  :  3   – 8   s  (light forms)
 *  Writing FR  :  5   – 12  s  (longest — user types a requirement)
 *  Browsing    :  1   – 3   s  (quick reads)
 *  Deletion    :  1   – 3   s  (confirm clicks)
 */
public class BackendLoadTest extends Simulation {

  // ── Protocol ──────────────────────────────────────────────────────────────

  HttpProtocolBuilder httpProtocol =
    http.baseUrl("http://api.irboard.local")
      .acceptHeader("application/json")
      .contentTypeHeader("application/json")
      .disableCaching()
      .maxConnectionsPerHost(6)
      .shareConnections();

  // ── Feeder ────────────────────────────────────────────────────────────────

  FeederBuilder<String> users =
    csv("C:/Users/javie/Desktop/proyectos/IRBoard/config/bulk-user-insert/userList.csv")
      .circular();

  // ── Reusable chain: one full project lifecycle ────────────────────────────
  //    Called 3× per session via repeat(). Each iteration creates a fresh
  //    project, works inside it, then deletes it.

  ChainBuilder projectLifecycle = exec(

    // ── Home refresh (user navigates back to dashboard) ───────────────────
    http("Get Home")
      .get("/v1/home")
      .header("Cookie", "#{authCookie}")
      .check(status().is(200))
  )
  .pause(Duration.ofMillis(2_000), Duration.ofMillis(4_000))

  // ── Create project ───────────────────────────────────────────────────────
  .pause(Duration.ofMillis(4_000), Duration.ofMillis(8_000))
  .exec(
    http("Create Project")
      .post("/v1/projects/new")
      .header("Cookie", "#{authCookie}")
      .body(StringBody(session -> {
        String field = session.getString("email")
                         .replaceFirst("@.*", "").replace(".", "-");
        long ts = System.currentTimeMillis();
        return "{\"name\":\"" + field + "-" + ts + "\","
             + "\"description\":\"description-" + ts + "\","
             + "\"client\":\"client-" + ts + "\","
             + "\"priorityStyle\":\"TERNARY\"}";
      }))
      .check(status().is(201))
      .check(jsonPath("$.id").saveAs("projectId"))
  )

  // ── Enter project ─────────────────────────────────────────────────────────
  .pause(Duration.ofMillis(1_000), Duration.ofMillis(2_500))
  .exec(
    http("Get Project Detail")
      .get("/v1/projects/#{projectId}")
      .header("Cookie", "#{authCookie}")
      .check(status().is(200))
  )
  .pause(Duration.ofMillis(2_000), Duration.ofMillis(4_000))

  // ── Create stakeholder ───────────────────────────────────────────────────
  .pause(Duration.ofMillis(3_000), Duration.ofMillis(6_000))
  .exec(
    http("Create Stakeholder")
      .post("/v1/projects/#{projectId}/stakeholders/new")
      .header("Cookie", "#{authCookie}")
      .body(StringBody(session -> {
        String pid = session.getString("projectId");
        long ts = System.currentTimeMillis();
        return "{\"name\":\"stakeholder-" + ts + "\","
             + "\"description\":\"description-" + ts + "\","
             + "\"projectId\":\"" + pid + "\"}";
      }))
      .check(status().is(201))
      .check(jsonPath("$.id").saveAs("stakeholderId"))
  )

  // ── View stakeholders ────────────────────────────────────────────────────
  .pause(Duration.ofMillis(1_000), Duration.ofMillis(2_500))
  .exec(
    http("Get Stakeholders")
      .get("/v1/projects/#{projectId}/stakeholders")
      .header("Cookie", "#{authCookie}")
      .check(status().is(200))
  )
  .pause(Duration.ofMillis(1_500), Duration.ofMillis(3_000))

  // ── View + create functionality ───────────────────────────────────────────
  .exec(
    http("Get Functionalities")
      .get("/v1/projects/#{projectId}/functionalities")
      .header("Cookie", "#{authCookie}")
      .check(status().is(200))
  )
  .pause(Duration.ofMillis(3_000), Duration.ofMillis(7_000))
  .exec(
    http("Create Functionality")
      .post("/v1/projects/#{projectId}/functionalities/new")
      .header("Cookie", "#{authCookie}")
      .body(StringBody(session -> {
        String pid = session.getString("projectId");
        long ts = System.currentTimeMillis();
        return "{\"name\":\"functionality-" + ts + "\","
             + "\"description\":\"description-" + ts + "\","
             + "\"label\":\"F\","
             + "\"projectId\":" + pid + "}";
      }))
      .check(status().is(201))
      .check(jsonPath("$.id").saveAs("functionalityId"))
  )

  // ── View FR list ─────────────────────────────────────────────────────────
  .pause(Duration.ofMillis(1_000), Duration.ofMillis(2_500))
  .exec(
    http("Get Functional Requirements List")
      .get("/v1/projects/#{projectId}/functionalities/#{functionalityId}/functionalRequirements/")
      .header("Cookie", "#{authCookie}")
      .check(status().is(200))
  )

  // ── Create FR (longest think time — user writes a requirement) ───────────
  .pause(Duration.ofMillis(5_000), Duration.ofMillis(12_000))
  .exec(
    http("Create Functional Requirement")
      .post("/v1/projects/#{projectId}/functionalities/#{functionalityId}/functionalRequirements/new")
      .header("Cookie", "#{authCookie}")
      .body(StringBody(session -> {
        String pid = session.getString("projectId");
        String fid = session.getString("functionalityId");
        long ts = System.currentTimeMillis();
        return "{\"name\":\"functional-requirement-" + ts + "\","
             + "\"description\":\"description-" + ts + "\","
             + "\"priority\":\"HIGH\","
             + "\"stability\":\"STABLE\","
             + "\"functionalityId\":" + fid + ","
             + "\"projectId\":" + pid + ","
             + "\"orderValue\":1000}";
      }))
      .check(status().is(201))
      .check(jsonPath("$.id").saveAs("frId"))
  )

  // ── View FR detail ────────────────────────────────────────────────────────
  .pause(Duration.ofMillis(2_000), Duration.ofMillis(4_000))
  .exec(
    http("Get Functional Requirement Detail")
      .get("/v1/projects/#{projectId}/functionalities/#{functionalityId}/functionalRequirements/#{frId}")
      .header("Cookie", "#{authCookie}")
      .check(status().is(200))
  )

  // ── Link stakeholder to FR ───────────────────────────────────────────────
  .pause(Duration.ofMillis(1_000), Duration.ofMillis(3_000))
  .exec(
    http("Link Stakeholder to FR")
      .post("/v1/projects/#{projectId}/functionalities/#{functionalityId}/functionalRequirements/#{frId}/linkStakeholder")
      .header("Cookie", "#{authCookie}")
      .body(StringBody(session -> session.getString("stakeholderId")))
      .check(status().in(200, 204))
  )

  // ── Browse NFRs + documents ───────────────────────────────────────────────
  .pause(Duration.ofMillis(1_500), Duration.ofMillis(3_500))
  .exec(
    http("Get NFRs")
      .get("/v1/projects/#{projectId}/nonFunctionalRequirements")
      .header("Cookie", "#{authCookie}")
      .check(status().is(200))
  )
  .pause(Duration.ofMillis(2_000), Duration.ofMillis(5_000))
  .exec(
    http("Get Documents")
      .get("/v1/projects/#{projectId}/documents")
      .header("Cookie", "#{authCookie}")
      .check(status().is(200))
  )

  // ── Delete project ────────────────────────────────────────────────────────
  .pause(Duration.ofMillis(2_000), Duration.ofMillis(5_000))
  .exec(
    http("Disable Project")
      .post("/v1/projects/#{projectId}/disable")
      .header("Cookie", "#{authCookie}")
      .check(status().in(200, 204))
  )
  .pause(Duration.ofMillis(500), Duration.ofMillis(1_200))
  .exec(
    http("Remove Project")
      .post("/v1/projects/#{projectId}/remove")
      .header("Cookie", "#{authCookie}")
      .check(status().in(200, 204))
  )
  .pause(Duration.ofMillis(1_000), Duration.ofMillis(2_500))
  .exec(
    http("Get Removed Projects View")
      .get("/v1/projects/removed")
      .header("Cookie", "#{authCookie}")
      .check(status().is(200))
  )
  .pause(Duration.ofMillis(500), Duration.ofMillis(1_500))
  .exec(
    http("Get Removed Project Detail")
      .get("/v1/projects/#{projectId}")
      .header("Cookie", "#{authCookie}")
      .check(status().in(200, 404))
  )
  .pause(Duration.ofMillis(500), Duration.ofMillis(1_200))
  .exec(
    http("Delete Project Permanently")
      .post("/v1/projects/#{projectId}/delete")
      .header("Cookie", "#{authCookie}")
      .check(status().in(200, 204))
  );

  // ── Scenario ──────────────────────────────────────────────────────────────

  ScenarioBuilder scn = scenario("Backend Load Test – Realistic")
    .feed(users)

    // ── 1. Login ─────────────────────────────────────────────────────────
    .exec(
      http("Init Login Flow")
        .get("http://auth.irboard.local/self-service/login/browser")
        .header("Accept", "application/json")
        .check(status().is(200))
        .check(bodyString().saveAs("flowBody"))
    )
    .exec(session -> {
      String body = session.getString("flowBody");
      int idIdx = body.indexOf("\"id\":\"") + 6;
      String flowId = body.substring(idIdx, body.indexOf("\"", idIdx));
      int csrfIdx = body.indexOf("\"csrf_token\"");
      String afterCsrf = body.substring(csrfIdx);
      int valIdx = afterCsrf.indexOf("\"value\":\"") + 9;
      String csrfToken = afterCsrf.substring(valIdx, afterCsrf.indexOf("\"", valIdx));
      return session.set("flowId", flowId).set("csrfToken", csrfToken);
    })
    .pause(Duration.ofMillis(500), Duration.ofMillis(1_200))
    .exec(
      http("Login Submit")
        .post("http://auth.irboard.local/self-service/login?flow=#{flowId}")
        .header("Accept", "application/json")
        .header("Content-Type", "application/json")
        .header("Origin", "http://irboard.local")
        .body(StringBody(session -> {
          String email    = session.getString("email");
          String password = session.getString("password")
                              .replace("\\", "\\\\").replace("\"", "\\\"");
          String csrf     = session.getString("csrfToken")
                              .replace("\\", "\\\\").replace("\"", "\\\"");
          return "{\"method\":\"password\",\"identifier\":\"" + email
               + "\",\"password\":\"" + password
               + "\",\"csrf_token\":\"" + csrf + "\"}";
        }))
        .check(status().is(200))
        .check(
          headerRegex("Set-Cookie", "irboard_session=([^;]+)")
            .find(0)
            .saveAs("sessionCookie")
        )
    )
    .exec(session -> {
      String cookie = session.getString("sessionCookie");
      if (cookie == null || cookie.isBlank()) {
        System.err.println("[WARN] No session cookie: " + session.getString("email"));
        return session.markAsFailed();
      }
      return session.set("authCookie", "irboard_session=" + cookie);
    })
    .exitHereIfFailed()
    .exec(
      http("Whoami")
        .get("/v1/whoami")
        .header("Cookie", "#{authCookie}")
        .check(status().is(200))
    )
    // User reads the dashboard after login
    .pause(Duration.ofMillis(3_000), Duration.ofMillis(6_000))

    // ── 2. Core work — repeated 3× ───────────────────────────────────────
    //    Each iteration ≈ 5–8 min  →  total session ≈ 15–25 min
    //    This ensures sessions are long enough to overlap fully during the
    //    2-minute ramp and the 20-minute peak phase.
    .repeat(3).on(exec(projectLifecycle))

    // ── 3. Logout ────────────────────────────────────────────────────────
    .pause(Duration.ofMillis(500), Duration.ofMillis(1_000))
    .exec(
      http("Init Logout")
        .get("http://auth.irboard.local/self-service/logout/browser")
        .header("Accept", "application/json")
        .header("Cookie", "#{authCookie}")
        .check(status().is(200))
        .check(bodyString().saveAs("logoutBody"))
    )
    .exec(session -> {
      String body = session.getString("logoutBody");
      int idx = body.indexOf("\"logout_token\":\"") + 16;
      String token = body.substring(idx, body.indexOf("\"", idx));
      return session.set("logoutToken", token);
    })
    .exec(
      http("Confirm Logout")
        .get("http://auth.irboard.local/self-service/logout?token=#{logoutToken}")
        .header("Cookie", "#{authCookie}")
        .check(status().in(200, 204, 302, 303))
    );

  // ── Injection ─────────────────────────────────────────────────────────────

  {
    setUp(
      scn.injectClosed(
        // 2 min ramp: all 500 VUs reach the work loop before the
        // first session can possibly finish (~15 min minimum).
        rampConcurrentUsers(0).to(500).during(Duration.ofMinutes(2)),

        // 20 min peak: sustain exactly 500 concurrent users.
        // Gatling immediately fills any slot a finishing VU frees.
        constantConcurrentUsers(500).during(Duration.ofMinutes(20)),

        // 3 min drain: ramp to 0, let in-flight sessions finish cleanly.
        rampConcurrentUsers(500).to(0).during(Duration.ofMinutes(3))
      )
    )
    .protocols(httpProtocol)
    .assertions(
      global().failedRequests().percent().lt(1.0),
      global().responseTime().percentile(95).lt(3_000)
    );
  }
}