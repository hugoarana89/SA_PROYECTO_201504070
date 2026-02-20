-- Database: auth_db
CREATE DATABASE IF NOT EXISTS auth_db;
USE auth_db;

-- Tabla de Usuarios
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('CLIENTE', 'RESTAURANTE', 'REPARTIDOR', 'ADMINISTRADOR') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

CREATE TABLE refresh_tokens (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    selector VARCHAR(32) UNIQUE NULL,
    expires_at DATETIME NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_refresh_user
      FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE,

    INDEX idx_user_id (user_id),
    INDEX idx_token_hash (token_hash),
    INDEX idx_selector (selector),
    INDEX idx_expires_at (expires_at)
);

-- Insertar usuario administrador por defecto
INSERT INTO users (email, password_hash, role) 
VALUES (
    'admin@admin.com', 
    '$2b$10$L9pWAdTnvrT5kJGJJGzug.gpzP8cHl6/llxW6sig2opN7DdZYb8/6', 
    'ADMINISTRADOR'
);