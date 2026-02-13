CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL UNIQUE,
  email VARCHAR(255)
);

CREATE TABLE resumes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  raw_text LONGTEXT,
  parsed_json JSON NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE portfolios (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  username VARCHAR(64) NOT NULL UNIQUE,
  template VARCHAR(64) NOT NULL,
  resume_json JSON NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE job_matches (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  job_description LONGTEXT NOT NULL,
  original_score FLOAT NOT NULL,
  improved_score FLOAT NOT NULL,
  improved_resume_json JSON NOT NULL,
  analysis_text LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_job_matches_user_id (user_id)
);
