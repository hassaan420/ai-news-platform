# News Verification Architecture

## Overview
The Cross-Source News Verification & Corroboration Layer is an enterprise-grade feature added to the AI News Platform. Its purpose is to determine whether an article is independently corroborated by other sources and identify similarities or conflicts between available reports. It does *not* claim absolute truth, but rather provides a confidence score based on multi-source consensus.

## Components

### 1. Scheduler Service (`scheduler-service`)
- **`NewsProvider.java`**: Extended with a `searchNews(String query)` interface.
- **Implementations**: `NewsApiProvider`, `GNewsProvider`, `GuardianProvider`, `MediastackProvider` implement search functionality to query their respective upstream APIs and map results to `NormalizedArticle`.
- **`SchedulerController.java`**: Exposes the internal `GET /api/scheduler/search?q={query}` endpoint, which aggregates results from all available providers.

### 2. News Service (`news-service`)
- **Entities**:
  - `ArticleVerification`: Stores the overall verification status, score, and timestamps.
  - `VerificationSource`: Stores the metadata of external sources used for corroboration.
  - `VerificationConflict`: Stores specific claims that conflict with external sources.
- **`ArticleVerificationService.java`**: The core verification engine. It:
  1. Fetches external articles via the Scheduler Service's search API.
  2. Filters out duplicate sources (e.g., same publisher).
  3. Calls the AI Service for analysis.
  4. Persists the results to the database.
- **`AiService.java` & `GeminiAiProvider.java`**: Uses a specialized prompt to compare the primary article against up to 5 independent external sources. It returns a structured JSON containing a corroboration score, status (e.g., `STRONGLY_CORROBORATED`), and any conflicts.
- **`ArticleAiProcessingService.java`**: Spawns a new asynchronous `VERIFICATION` task in the `AiProcessingQueue` after the standard `FULL_AI_PROCESSING` is complete.
- **`ArticleController.java`**: Exposes the public `GET /api/news/{id}/verification` endpoint with Redis caching (`@Cacheable`).

## Database Schema
- **`article_verifications`**: Links to `articles`.
- **`verification_sources`**: Links to `article_verifications`.
- **`verification_conflicts`**: Links to `article_verifications`.
- The `articles` table was also updated to include a `publisher` column for tracking the source of the primary article.

## Workflow
1. An article is ingested and saved to the database.
2. The AI Processing Queue runs standard NLP analysis (Summary, Sentiment, Keywords).
3. Upon completion, a new `VERIFICATION` task is queued.
4. The Verification Engine runs, querying external APIs for related news.
5. Gemini AI compares the primary article with external sources and generates a corroboration report.
6. The report is saved to the DB and can be retrieved via the API.
