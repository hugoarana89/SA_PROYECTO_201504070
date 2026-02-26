-- ─────────────────────────────────────────
-- Database: restaurant_db
-- ─────────────────────────────────────────
CREATE DATABASE IF NOT EXISTS restaurant_db;

USE restaurant_db;

CREATE TABLE
    restaurants (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID ()),
        owner_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        address VARCHAR(500) NOT NULL,
        phone VARCHAR(20),
        opening_time TIME,
        closing_time TIME,
        is_active BOOLEAN DEFAULT TRUE,
        -- FASE 2: promedio de calificación desnormalizado (actualizado por Rating-Service)
        avg_rating DECIMAL(3, 2) DEFAULT NULL COMMENT 'Promedio de estrellas actualizado por Rating-Service',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_owner_id (owner_id),
        INDEX idx_is_active (is_active)
    );

CREATE TABLE
    menu_items (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID ()),
        restaurant_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image_url VARCHAR(500),
        is_available BOOLEAN DEFAULT TRUE,
        -- FASE 2: contadores de recomendación actualizados por Rating-Service
        recommendation_count INT DEFAULT 0 COMMENT 'Contador de recomendaciones positivas',
        not_recommended_count INT DEFAULT 0 COMMENT 'Contador de no recomendaciones',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants (id) ON DELETE CASCADE,
        INDEX idx_restaurant_id (restaurant_id),
        INDEX idx_is_available (is_available)
    );