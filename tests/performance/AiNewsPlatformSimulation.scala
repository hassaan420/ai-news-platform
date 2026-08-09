package performance

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

class AiNewsPlatformSimulation extends Simulation {

  val httpProtocol = http
    .baseUrl("http://localhost:8080")
    .acceptHeader("application/json")
    .userAgentHeader("Gatling/PerformanceTest")

  val scn = scenario("Standard User Browsing and Searching")
    .exec(
      http("Get Trending Articles")
        .get("/api/articles/trending")
        .check(status.is(200))
    )
    .pause(2)
    .exec(
      http("Semantic Search")
        .get("/api/news/search/semantic")
        .queryParam("q", "machine learning advances")
        .check(status.is(200))
        .check(jsonPath("$..id").exists)
    )
    .pause(3)
    .exec(
      http("View Specific Article")
        .get("/api/articles/1")
        .check(status.in(200, 404)) // Allowing 404 in case ID 1 doesn't exist in test DB
    )

  setUp(
    scn.inject(
      rampUsersPerSec(10).to(100).during(1.minute), // Ramp up
      constantUsersPerSec(100).during(3.minutes)    // Hold load
    ).protocols(httpProtocol)
  )
}
