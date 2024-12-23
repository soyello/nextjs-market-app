CREATE TABLE users(
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified DATETIME NULL,
  image VARCHAR(255) NULL
),

CREATE TABLE sessions(
  id VARCHAR(255) PRIMARY KEY,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  expires DATETIME NOT NULL,
  CONSTRAINT fk_session_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)