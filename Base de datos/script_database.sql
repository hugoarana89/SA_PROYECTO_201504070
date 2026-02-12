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
    INDEX idx_expires_at (expires_at)
);


-- Database: restaurant_db
CREATE DATABASE IF NOT EXISTS restaurant_db;
USE restaurant_db;

-- Tabla de Restaurantes
CREATE TABLE restaurants (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    owner_id VARCHAR(36) NOT NULL, -- Referencia lógica al usuario en auth_db
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(500) NOT NULL,
    phone VARCHAR(20),
    opening_time TIME,
    closing_time TIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_owner_id (owner_id),
    INDEX idx_is_active (is_active)
);

-- Tabla de Ítems del Menú
CREATE TABLE menu_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_restaurant_id (restaurant_id),
    INDEX idx_is_available (is_available)
);

-- Database: order_service
CREATE DATABASE IF NOT EXISTS order_service_db;
USE order_service_db;

-- Tabla de ordenes
CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    client_user_id BIGINT NOT NULL,
    restaurant_id BIGINT NOT NULL,
    status ENUM(
        'CREADA',
        'CANCELADA',
        'EN_PROCESO',
        'FINALIZADA',
        'RECHAZADA',
        'LISTA',
        'EN_CAMINO',
        'ENTREGADA'
    ) NOT NULL DEFAULT 'CREADA',
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	
	INDEX idx_client_user_id (client_user_id),
    INDEX idx_restaurant_id (restaurant_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Tabla de items de la orden
CREATE TABLE order_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_id VARCHAR(36) NOT NULL,
    menu_item_id BIGINT NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    
	INDEX idx_order_id (order_id),
    INDEX idx_menu_item_id (menu_item_id)
);

-- Database: delivery_db
CREATE DATABASE IF NOT EXISTS delivery_db;
USE delivery_db;

-- Tabla de Repartidores
CREATE TABLE deliveries (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_id VARCHAR(36) NOT NULL, -- este es el id de la orden
    delivery_user_id VARCHAR(36) NOT NULL, -- Referencia al usuario repartidor en auth_db 
    status ENUM(
        'ASIGNADA',
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
