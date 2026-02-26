-- ─────────────────────────────────────────
-- Database: rating_db  (NUEVA — Fase 2)
-- ─────────────────────────────────────────
CREATE DATABASE IF NOT EXISTS rating_db;

USE rating_db;

CREATE TABLE
    delivery_ratings (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID ()),
        order_id VARCHAR(36) NOT NULL UNIQUE COMMENT 'Una calificación por orden',
        client_user_id VARCHAR(36) NOT NULL,
        delivery_user_id VARCHAR(36) NOT NULL,
        stars TINYINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
        comment TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_delivery_user_id (delivery_user_id),
        INDEX idx_order_id (order_id)
    );

CREATE TABLE
    restaurant_ratings (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID ()),
        order_id VARCHAR(36) NOT NULL UNIQUE,
        client_user_id VARCHAR(36) NOT NULL,
        restaurant_id VARCHAR(36) NOT NULL,
        stars TINYINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
        comment TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_restaurant_id (restaurant_id),
        INDEX idx_order_id (order_id)
    );

CREATE TABLE
    product_ratings (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID ()),
        order_id VARCHAR(36) NOT NULL,
        client_user_id VARCHAR(36) NOT NULL,
        menu_item_id VARCHAR(36) NOT NULL COMMENT 'Referencia lógica al item en restaurant_db',
        recommended BOOLEAN NOT NULL COMMENT 'TRUE = recomendado, FALSE = no recomendado',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_order_product (order_id, menu_item_id),
        INDEX idx_menu_item_id (menu_item_id),
        INDEX idx_order_id (order_id)
    );