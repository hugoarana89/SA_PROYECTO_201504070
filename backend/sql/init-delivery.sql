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
