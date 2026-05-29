SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS legionshop
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE legionshop;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS product_specs;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- USERS
CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address VARCHAR(500),
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PRODUCTS
CREATE TABLE products (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    price BIGINT,
    old_price BIGINT,
    discount INT,
    sku VARCHAR(50) NOT NULL,
    description TEXT,
    image_url LONGTEXT,
    PRIMARY KEY (id),
    UNIQUE KEY uk_products_sku (sku)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PRODUCT SPECS
CREATE TABLE product_specs (
    id BIGINT NOT NULL AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    spec_key VARCHAR(100) NOT NULL,
    spec_value TEXT,
    PRIMARY KEY (id),
    FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- CARTS
CREATE TABLE carts (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    updated_at DATETIME,
    PRIMARY KEY (id),
    UNIQUE KEY uk_carts_user_email (user_email),
    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- CART ITEMS
CREATE TABLE cart_items (
    id BIGINT NOT NULL AUTO_INCREMENT,
    cart_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_cart_items_cart_product (cart_id, product_id),
    FOREIGN KEY (cart_id) REFERENCES carts(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ORDERS
CREATE TABLE orders (
    id BIGINT NOT NULL AUTO_INCREMENT,
    code VARCHAR(30) NOT NULL,
    user_id BIGINT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(30),
    shipping_address TEXT,
    total_price BIGINT NOT NULL,

    payment_method VARCHAR(30) NOT NULL DEFAULT 'COD',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID',

    status VARCHAR(30) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_orders_code (code),

    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ORDER ITEMS
CREATE TABLE order_items (
    id BIGINT NOT NULL AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    image_url LONGTEXT,
    price BIGINT NOT NULL,
    quantity INT NOT NULL,
    line_total BIGINT NOT NULL,
    PRIMARY KEY (id),

    FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- USERS DATA
INSERT INTO users VALUES
(1,'Quản trị viên HUI LEGION','admin@legion.com','$2a$10$xxx','0900000001','Hà Nội','ADMIN','ACTIVE','2026-01-01 09:00:00'),
(2,'Nguyễn Văn An','an@gmail.com','$2a$10$xxx','0911111111','123 Lê Lợi, Q1','USER','ACTIVE','2026-01-05 10:00:00'),
(3,'Trần Thị Bình','binh@gmail.com','$2a$10$xxx','0922222222','45 Nguyễn Huệ','USER','ACTIVE','2026-01-07 11:00:00');

-- PRODUCTS DATA
INSERT INTO products VALUES
(1,'Lenovo Legion 5 15IRX9',32990000,35990000,8,'LEGION5-15IRX9','Gaming Laptop','../Images/imgproductslegion5.jpg'),
(2,'Lenovo Legion 5 Pro 16IRX9',42990000,46990000,9,'LEGION5PRO-16IRX9','Gaming Laptop','../Images/legion5pro.png'),
(3,'Lenovo Legion 7 16IRX9',56990000,61990000,8,'LEGION7-16IRX9','Gaming Laptop','../Images/productlegion7.jpg');

-- PRODUCT SPECS
INSERT INTO product_specs(product_id,spec_key,spec_value) VALUES
(1,'CPU','Intel Core i7-14650HX'),
(1,'GPU','RTX 4060'),
(2,'CPU','Intel Core i7-14700HX'),
(3,'CPU','Intel Core i9-14900HX');

-- CARTS
INSERT INTO carts VALUES
(1,2,'an@gmail.com','2026-04-10 09:15:00');

-- CART ITEMS
INSERT INTO cart_items(cart_id,product_id,quantity) VALUES
(1,1,1),
(1,2,1);

-- ORDERS DATA
INSERT INTO orders VALUES
(1,'HD00001',2,'an@gmail.com','Nguyễn Văn An','0911111111','123 Lê Lợi',42990000,'BANK_TRANSFER','PAID','shipping','2026-04-01 09:30:00'),
(2,'HD00002',3,'binh@gmail.com','Trần Thị Bình','0922222222','45 Nguyễn Huệ',56990000,'MOMO','UNPAID','pending','2026-04-03 14:20:00'),
(3,'HD00003',2,'an@gmail.com','Nguyễn Văn An','0911111111','123 Lê Lợi',23990000,'COD','UNPAID','done','2026-04-05 19:05:00');

-- ORDER ITEMS
INSERT INTO order_items(order_id,product_id,name,image_url,price,quantity,line_total) VALUES
(1,2,'Lenovo Legion 5 Pro 16IRX9','../Images/legion5pro.png',42990000,1,42990000),
(2,3,'Lenovo Legion 7 16IRX9','../Images/productlegion7.jpg',56990000,1,56990000),
(3,1,'Lenovo Legion 5 15IRX9','../Images/imgproductslegion5.jpg',23990000,1,23990000);

-- RESET AUTO_INCREMENT
ALTER TABLE users AUTO_INCREMENT = 10;
ALTER TABLE products AUTO_INCREMENT = 10;
ALTER TABLE product_specs AUTO_INCREMENT = 100;
ALTER TABLE carts AUTO_INCREMENT = 10;
ALTER TABLE cart_items AUTO_INCREMENT = 10;
ALTER TABLE orders AUTO_INCREMENT = 10;
ALTER TABLE order_items AUTO_INCREMENT = 10;

SET FOREIGN_KEY_CHECKS = 1;

SHOW TABLES;