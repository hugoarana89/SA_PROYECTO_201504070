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