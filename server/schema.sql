-- FloorPlan Pro – MySQL Schema
-- Run this on your `floorplan_db` database

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120)  NOT NULL DEFAULT '',
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS projects (
  id          VARCHAR(64)   NOT NULL PRIMARY KEY,   -- client-generated string id
  user_id     INT UNSIGNED  NOT NULL,
  name        VARCHAR(255)  NOT NULL DEFAULT 'Sem Título',
  data        LONGTEXT      NOT NULL,               -- JSON blob
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_projects_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS custom_presets (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED  NOT NULL,
  name        VARCHAR(120)  NOT NULL,
  type        ENUM('furniture','door','window','text') NOT NULL DEFAULT 'furniture',
  width       DECIMAL(10,2) NOT NULL DEFAULT 90,
  depth       DECIMAL(10,2) NOT NULL DEFAULT 90,
  color       VARCHAR(20)   NOT NULL DEFAULT '#3b82f6',
  icon        VARCHAR(60)   NOT NULL DEFAULT 'table',
  font_size   INT           NOT NULL DEFAULT 16,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_presets_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
