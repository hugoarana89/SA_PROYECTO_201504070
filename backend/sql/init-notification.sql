-- Database: notification_db
CREATE DATABASE IF NOT EXISTS notification_db;
USE notification_db;

-- Tabla de notificaciones
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL, -- Referencia al cliente (no delivery) en auth_db
	delivery_user_id VARCHAR(36) NOT NULL, -- Referencia al delivery en auth_db, 
    order_id VARCHAR(36),
    order_type ENUM(
        'ORDER_CREATED',
        'ORDER_CANCELLED',
        'ORDER_SHIPPED',
        'ORDER_REJECTED'
    ) NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
	INDEX idx_user_id (user_id),
    INDEX idx_order_id (order_id),
    INDEX idx_order_type (order_type),
    INDEX idx_csent_at (sent_at),
	INDEX idx_delivery_user_id (delivery_user_id)
);
