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