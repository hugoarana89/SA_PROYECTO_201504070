-- Database: delivery_db
CREATE DATABASE IF NOT EXISTS delivery_db;
USE delivery_db;

-- Tabla de Repartidores
CREATE TABLE deliveries (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_id VARCHAR(36) NOT NULL, -- este es el id de la orden
    delivery_user_id VARCHAR(36) NOT NULL, -- Referencia al usuario repartidor en auth_db 
    status ENUM(
        'EN_CAMINO',
        'ENTREGADA',
        'CANCELADA'
    ) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP NULL,
    cancel_reason VARCHAR(255),

    INDEX idx_order (order_id),
    INDEX idx_delivery_user_id (delivery_user_id),
	INDEX idx_status (status)
);