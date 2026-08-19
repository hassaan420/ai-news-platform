-- Migration for Cross-Source News Verification & Corroboration

-- 1. Add publisher field to track actual provenance distinct from the API Provider
-- ALTER TABLE articles ADD COLUMN publisher VARCHAR(200);

-- 2. Article Verifications table
CREATE TABLE article_verifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    article_id BIGINT UNSIGNED NOT NULL,
    status VARCHAR(50) NOT NULL,
    verification_score INT NOT NULL,
    sources_found INT NOT NULL,
    independent_sources INT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    last_verified_at DATETIME NOT NULL,
    CONSTRAINT fk_verification_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- 3. Verification Sources table
CREATE TABLE verification_sources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    verification_id BIGINT NOT NULL,
    source_name VARCHAR(200) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    published_at DATETIME,
    similarity_score DOUBLE,
    relationship VARCHAR(50),
    CONSTRAINT fk_verif_source FOREIGN KEY (verification_id) REFERENCES article_verifications(id) ON DELETE CASCADE
);

-- 4. Verification Conflicts table
CREATE TABLE verification_conflicts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    verification_id BIGINT NOT NULL,
    claim_text TEXT NOT NULL,
    conflicting_source_url VARCHAR(1000),
    CONSTRAINT fk_verif_conflict FOREIGN KEY (verification_id) REFERENCES article_verifications(id) ON DELETE CASCADE
);
