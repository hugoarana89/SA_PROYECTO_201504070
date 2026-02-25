-- ═══════════════════════════════════════════════════════════════
-- DELIVEREATS — Script completo de Base de Datos (Fase 1 + Fase 2)
-- ═══════════════════════════════════════════════════════════════
-- ─────────────────────────────────────────
-- Database: auth_db
-- ─────────────────────────────────────────
CREATE DATABASE IF NOT EXISTS auth_db;

USE auth_db;

CREATE TABLE
    users (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID ()),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM (
            'CLIENTE',
            'RESTAURANTE',
            'REPARTIDOR',
            'ADMINISTRADOR'
        ) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
    );

CREATE TABLE
    refresh_tokens (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID ()),
        user_id VARCHAR(36) NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        selector VARCHAR(32) UNIQUE NULL,
        expires_at DATETIME NOT NULL,
        revoked BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_token_hash (token_hash),
        INDEX idx_selector (selector),
        INDEX idx_expires_at (expires_at)
    );

INSERT INTO
    users (email, password_hash, role)
VALUES
    (
        'admin@admin.com',
        '$2b$10$L9pWAdTnvrT5kJGJJGzug.gpzP8cHl6/llxW6sig2opN7DdZYb8/6',
        'ADMINISTRADOR'
    );

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

-- ─────────────────────────────────────────
-- Database: order_db
-- ─────────────────────────────────────────
CREATE DATABASE IF NOT EXISTS order_db;

USE order_db;

CREATE TABLE
    orders (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID ()),
        client_user_id VARCHAR(36) NOT NULL,
        restaurant_id VARCHAR(36) NOT NULL,
        status ENUM (
            'CREADA',
            'CANCELADA',
            'EN_PROCESO',
            'FINALIZADA',
            'RECHAZADA',
            'LISTA',
            -- FASE 2: nuevos estados
            'EN_CAMINO',
            'ENTREGADA',
            'PAGADA'
        ) NOT NULL DEFAULT 'CREADA',
        total_amount DECIMAL(10, 2) NOT NULL,
        -- FASE 2: referencia lógica al pago en payment_db
        payment_id VARCHAR(36) NULL COMMENT 'Referencia lógica al pago en payment_db',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_client_user_id (client_user_id),
        INDEX idx_restaurant_id (restaurant_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
    );

CREATE TABLE
    order_items (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID ()),
        order_id VARCHAR(36) NOT NULL,
        menu_item_id VARCHAR(36) NOT NULL,
        product_name VARCHAR(150) NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
        INDEX idx_order_id (order_id),
        INDEX idx_menu_item_id (menu_item_id)
    );

-- ─────────────────────────────────────────
-- Database: delivery_db
-- ─────────────────────────────────────────
CREATE DATABASE IF NOT EXISTS delivery_db;

USE delivery_db;

CREATE TABLE
    deliveries (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID ()),
        order_id VARCHAR(36) NOT NULL,
        delivery_user_id VARCHAR(36) NOT NULL,
        status ENUM ('EN_CAMINO', 'ENTREGADA', 'CANCELADA') NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        delivered_at TIMESTAMP NULL,
        -- FASE 2: URL de la foto de entrega obligatoria almacenada en Google Cloud Storage
        proof_image_url VARCHAR(1000) NULL COMMENT 'URL GCS con la fotografía de entrega obligatoria',
        cancel_reason VARCHAR(255),
        INDEX idx_order (order_id),
        INDEX idx_delivery_user_id (delivery_user_id),
        INDEX idx_status (status)
    );

-- ─────────────────────────────────────────
-- Database: notification_db
-- ─────────────────────────────────────────
CREATE DATABASE IF NOT EXISTS notification_db;

USE notification_db;

CREATE TABLE
    notifications (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID ()),
        user_id VARCHAR(36) NOT NULL,
        delivery_user_id VARCHAR(36) NULL,
        order_id VARCHAR(36) NULL,
        order_type ENUM (
            'ORDEN_CREADA',
            'CANCELADA_CLIENTE',
            'CANCELADA_RESTAURANTE',
            'CANCELADA_REPARTIDOR',
            'EN_CAMINO',
            'RECHAZADA',
            -- FASE 2: nuevos tipos de notificación
            'PAGADA',
            'PAGO_FALLIDO',
            'ENTREGADA'
        ) NOT NULL,
        content TEXT NOT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_order_id (order_id),
        INDEX idx_order_type (order_type),
        INDEX idx_sent_at (sent_at),
        INDEX idx_delivery_user_id (delivery_user_id)
    );

-- ═══════════════════════════════════════════════════════════════
-- FASE 2 — Bases de datos nuevas
-- ═══════════════════════════════════════════════════════════════
-- ─────────────────────────────────────────
-- Database: payment_db  (NUEVA — Fase 2)
-- ─────────────────────────────────────────
CREATE DATABASE IF NOT EXISTS payment_db;

USE payment_db;

CREATE TABLE
    wallets (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID ()),
        user_id VARCHAR(36) NOT NULL UNIQUE COMMENT 'Referencia lógica al usuario en auth_db',
        balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id)
    );

CREATE TABLE
    wallet_transactions (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID ()),
        wallet_id VARCHAR(36) NOT NULL,
        type ENUM ('RECARGA', 'PAGO', 'REEMBOLSO') NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (wallet_id) REFERENCES wallets (id) ON DELETE CASCADE,
        INDEX idx_wallet_id (wallet_id),
        INDEX idx_type (type)
    );

CREATE TABLE
    coupons (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID ()),
        code VARCHAR(50) UNIQUE NOT NULL,
        discount_type ENUM ('PORCENTAJE', 'MONTO_FIJO') NOT NULL,
        discount_value DECIMAL(10, 2) NOT NULL,
        min_order_amount DECIMAL(10, 2) DEFAULT 0.00,
        max_uses INT DEFAULT NULL COMMENT 'NULL = usos ilimitados',
        current_uses INT DEFAULT 0,
        expires_at DATETIME NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_code (code),
        INDEX idx_is_active (is_active),
        INDEX idx_expires_at (expires_at)
    );

CREATE TABLE
    payments (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID ()),
        order_id VARCHAR(36) NOT NULL UNIQUE COMMENT 'Referencia lógica a la orden en order_db',
        user_id VARCHAR(36) NOT NULL COMMENT 'Referencia lógica al usuario en auth_db',
        method ENUM (
            'TARJETA_CREDITO',
            'TARJETA_DEBITO',
            'CARTERA_DIGITAL'
        ) NOT NULL,
        status ENUM ('PENDIENTE', 'PAGADO', 'FALLIDO', 'REEMBOLSADO') NOT NULL DEFAULT 'PENDIENTE',
        amount DECIMAL(10, 2) NOT NULL,
        coupon_id VARCHAR(36) NULL,
        discount_applied DECIMAL(10, 2) DEFAULT 0.00,
        final_amount DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (coupon_id) REFERENCES coupons (id) ON DELETE SET NULL,
        INDEX idx_order_id (order_id),
        INDEX idx_user_id (user_id),
        INDEX idx_status (status)
    );

-- ─────────────────────────────────────────
-- Database: fx_db  (NUEVA — Fase 2)
-- ─────────────────────────────────────────
CREATE DATABASE IF NOT EXISTS fx_db;

USE fx_db;

CREATE TABLE
    exchange_rates (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID ()),
        base_currency VARCHAR(10) NOT NULL COMMENT 'Moneda base, ej. GTQ',
        target_currency VARCHAR(10) NOT NULL COMMENT 'Moneda destino, ej. USD, EUR, MXN',
        rate DECIMAL(18, 6) NOT NULL,
        source VARCHAR(100) DEFAULT 'open.er-api.com',
        fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL COMMENT 'fetched_at + 12 horas',
        INDEX idx_currencies (base_currency, target_currency),
        INDEX idx_expires_at (expires_at)
    );

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