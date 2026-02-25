-- Keells Delivery System - Database Schema and Sample Data
-- Run this script in PgAdmin: Tools > Query Tool, connect to keells_system, then execute

-- Drop existing tables (reverse order of dependencies)
DROP TABLE IF EXISTS order_tracking CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS discounts CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create tables
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE addresses (
    id BIGSERIAL PRIMARY KEY,
    province VARCHAR(255) NOT NULL,
    district VARCHAR(255) NOT NULL,
    street_address VARCHAR(500) NOT NULL,
    postal_code VARCHAR(20),
    is_default BOOLEAN NOT NULL DEFAULT false,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(500)
);

CREATE TABLE discounts (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    valid_from TIMESTAMP,
    valid_to TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    image_url VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT true,
    category_id BIGINT NOT NULL REFERENCES categories(id),
    discount_id BIGINT REFERENCES discounts(id)
);

CREATE TABLE carts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE cart_items (
    id BIGSERIAL PRIMARY KEY,
    quantity INTEGER NOT NULL DEFAULT 1,
    cart_id BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id)
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_address VARCHAR(500) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'READY',
    payment_completed BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id)
);

CREATE TABLE order_tracking (
    id BIGSERIAL PRIMARY KEY,
    status VARCHAR(20) NOT NULL,
    description VARCHAR(500),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE
);

-- Sample Data
-- Note: Admin user (admin@keells.lk / admin123) is created by the app on first run.
-- Categories
INSERT INTO categories (name, description) VALUES
('Groceries', 'Fresh produce and daily essentials'),
('Dairy & Eggs', 'Milk, cheese, eggs and more'),
('Beverages', 'Drinks and refreshments');

-- Discounts
INSERT INTO discounts (name, percentage, active) VALUES
('Weekly Special', 10.00, true),
('New Year Sale', 20.00, true);

-- Products
INSERT INTO products (name, description, price, stock_quantity, category_id, discount_id) VALUES
('Fresh Milk 1L', 'Full cream fresh milk', 280.00, 50, 1, 1),
('White Bread', 'Soft white bread loaf', 180.00, 100, 1, NULL),
('Eggs (6pcs)', 'Farm fresh eggs', 350.00, 80, 2, NULL),
('Cheese 200g', 'Cheddar cheese block', 650.00, 30, 2, 2),
('Mineral Water 1.5L', 'Pure drinking water', 120.00, 200, 3, NULL),
('Orange Juice 1L', 'Fresh orange juice', 450.00, 40, 3, 1);

-- Success message
SELECT 'Keells system tables and sample data created successfully!' AS message;
