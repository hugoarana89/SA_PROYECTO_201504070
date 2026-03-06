-- Database: notification_db
CREATE DATABASE IF NOT EXISTS notification_db;
USE notification_db;

-- Tabla de notificaciones
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL, -- Cliente destinatario
	delivery_user_id VARCHAR(36) NULL, -- Repartidor (solo si aplica)
    order_id VARCHAR(36) NULL,
    order_type ENUM(
        'ORDEN_CREADA',
        'CANCELADA_CLIENTE',
        'CANCELADA_RESTAURANTE',
        'CANCELADA_REPARTIDOR',
        'EN_CAMINO',
        'RECHAZADA'
    ) NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
	INDEX idx_user_id (user_id),
    INDEX idx_order_id (order_id),
    INDEX idx_order_type (order_type),
    INDEX idx_sent_at (sent_at),
	INDEX idx_delivery_user_id (delivery_user_id)
);