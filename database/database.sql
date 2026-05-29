SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS legionshop
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE legionshop;

DROP TABLE IF EXISTS order_status_histories;
DROP TABLE IF EXISTS laptop_service_requests;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS product_specs;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- USERS
-- Mật khẩu mẫu:
-- admin@legion.com / admin123
-- user thường / 123456
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
    reset_password_token VARCHAR(255) NULL,
    reset_password_token_expires_at DATETIME NULL,
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
    image_urls LONGTEXT NULL,
    stock_quantity INT DEFAULT 0,
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
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ORDER STATUS HISTORY
CREATE TABLE order_status_histories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    note VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_status_history_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SERVICE REQUESTS
CREATE TABLE laptop_service_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(30) NOT NULL UNIQUE,
    user_id BIGINT,
    user_email VARCHAR(255),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    device_name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    service_type VARCHAR(30) NOT NULL,
    issue_description TEXT NOT NULL,
    device_condition TEXT,
    estimated_cost BIGINT DEFAULT 0,
    technician_note TEXT,
    status VARCHAR(30) DEFAULT 'received',
    appointment_date DATETIME,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT fk_service_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- USERS DATA
INSERT INTO users(id, fullname, email, password, phone, address, role, status, created_at) VALUES
(1,'Quản trị viên HUI LEGION','admin@legion.com','$2a$10$O81goEvkKdDoOZkY0vg4JOasL5y88odjj.vIraqd0hjEijDiJmbQm','0900000001','Hà Nội','ADMIN','ACTIVE','2026-01-01 09:00:00'),
(2,'Nguyễn Văn An','an@gmail.com','$2a$10$EfmzU5nle78/T0D1/3Qrred12GSGN1xX5dt12vHSvJX5iA7GLDT5m','0911111111','123 Lê Lợi, Quận 1, TP.HCM','USER','ACTIVE','2026-01-05 10:00:00'),
(3,'Trần Thị Bình','binh@gmail.com','$2a$10$EfmzU5nle78/T0D1/3Qrred12GSGN1xX5dt12vHSvJX5iA7GLDT5m','0922222222','45 Nguyễn Huệ, Đà Nẵng','USER','ACTIVE','2026-01-07 11:00:00'),
(4,'Lê Minh Khôi','khoi@gmail.com','$2a$10$EfmzU5nle78/T0D1/3Qrred12GSGN1xX5dt12vHSvJX5iA7GLDT5m','0933333333','88 Trần Duy Hưng, Hà Nội','USER','ACTIVE','2026-02-01 08:30:00'),
(5,'Phạm Thu Hà','ha@gmail.com','$2a$10$EfmzU5nle78/T0D1/3Qrred12GSGN1xX5dt12vHSvJX5iA7GLDT5m','0944444444','22 Cầu Giấy, Hà Nội','USER','ACTIVE','2026-02-05 15:45:00'),
(6,'Đỗ Quốc Nam','nam@gmail.com','$2a$10$EfmzU5nle78/T0D1/3Qrred12GSGN1xX5dt12vHSvJX5iA7GLDT5m','0955555555','9 Phan Đình Phùng, Huế','USER','LOCKED','2026-02-10 12:10:00');

-- PRODUCTS DATA
INSERT INTO products(id, name, price, old_price, discount, sku, description, image_url, image_urls, stock_quantity) VALUES
(1,'Lenovo Legion 5 15IRX9',32990000,35990000,8,'LEGION5-15IRX9','Gaming laptop cân bằng hiệu năng, phù hợp học tập, thiết kế và chơi game.','../Images/imgproductslegion5.jpg','../Images/imgproductslegion5.jpg||../Images/legion5pro.png',18),
(2,'Lenovo Legion 5 Pro 16IRX9',42990000,46990000,9,'LEGION5PRO-16IRX9','Màn hình 16 inch, hiệu năng cao cho game thủ và đồ họa.','../Images/legion5pro.png','../Images/legion5pro.png||../Images/productlegion7.jpg',12),
(3,'Lenovo Legion 7 16IRX9',56990000,61990000,8,'LEGION7-16IRX9','Dòng cao cấp, thiết kế đẹp, tản nhiệt mạnh, hiệu năng flagship.','../Images/productlegion7.jpg','../Images/productlegion7.jpg',7),
(4,'Lenovo Legion Slim 5 16AHP9',35990000,38990000,8,'SLIM5-16AHP9','Thiết kế mỏng nhẹ hơn, dùng AMD Ryzen, phù hợp di chuyển.','../Images/imgproductslegion5.jpg','../Images/imgproductslegion5.jpg',15),
(5,'Lenovo Legion Slim 7 16IRH8',48990000,52990000,8,'SLIM7-16IRH8','Laptop gaming mỏng cao cấp, hiệu năng tốt, ngoại hình sang.','../Images/productlegion7.jpg','../Images/productlegion7.jpg||../Images/legion5pro.png',5),
(6,'Lenovo LOQ 15IRX9',24990000,27990000,11,'LOQ15-IRX9','Dòng gaming phổ thông, giá tốt cho sinh viên.','../Images/imgproductslegion5.jpg','../Images/imgproductslegion5.jpg',25),
(7,'Lenovo LOQ 15AHP9',23990000,26990000,11,'LOQ15-AHP9','Gaming AMD giá tốt, phù hợp eSport và học tập.','../Images/legion5pro.png','../Images/legion5pro.png',0),
(8,'Lenovo Legion 9i 16IRX9',99990000,109990000,9,'LEGION9I-16IRX9','Dòng flagship cao cấp nhất, hiệu năng cực mạnh.','../Images/productlegion7.jpg','../Images/productlegion7.jpg',2),
(9,'Lenovo Legion Pro 7i 16IRX9H',72990000,78990000,8,'PRO7I-16IRX9H','RTX cao cấp, CPU HX, dành cho game AAA và render.','../Images/productlegion7.jpg','../Images/productlegion7.jpg||../Images/legion5pro.png',4),
(10,'Lenovo IdeaPad Gaming 3',17990000,19990000,10,'IDEAPAD-G3','Laptop gaming nhập môn, phù hợp ngân sách thấp.','../Images/imgproductslegion5.jpg','../Images/imgproductslegion5.jpg',30),
(11,'Lenovo Legion 5 15ACH6',21990000,24990000,12,'LEGION5-15ACH6','Máy cũ/like new cấu hình tốt, giá hợp lý.','../Images/legion5pro.png','../Images/legion5pro.png',9),
(12,'Lenovo Legion 5i 2023',29990000,32990000,9,'LEGION5I-2023','Dòng 2023 ổn định, màn đẹp, hiệu năng tốt.','../Images/imgproductslegion5.jpg','../Images/imgproductslegion5.jpg',14);

-- PRODUCT SPECS
INSERT INTO product_specs(product_id,spec_key,spec_value) VALUES
(1,'CPU','Intel Core i7-14650HX'),(1,'GPU','NVIDIA GeForce RTX 4060 8GB'),(1,'RAM','16GB DDR5'),(1,'SSD','1TB NVMe'),(1,'Màn hình','15.6 inch FHD 165Hz'),
(2,'CPU','Intel Core i7-14700HX'),(2,'GPU','RTX 4070 8GB'),(2,'RAM','32GB DDR5'),(2,'SSD','1TB NVMe'),(2,'Màn hình','16 inch 2.5K 240Hz'),
(3,'CPU','Intel Core i9-14900HX'),(3,'GPU','RTX 4080 12GB'),(3,'RAM','32GB DDR5'),(3,'SSD','2TB NVMe'),(3,'Màn hình','16 inch 3.2K 165Hz'),
(4,'CPU','AMD Ryzen 7 8845HS'),(4,'GPU','RTX 4060'),(4,'RAM','16GB DDR5'),(4,'SSD','1TB NVMe'),
(5,'CPU','Intel Core i7-13700H'),(5,'GPU','RTX 4070'),(5,'RAM','32GB DDR5'),(5,'SSD','1TB NVMe'),
(6,'CPU','Intel Core i5-13450HX'),(6,'GPU','RTX 4050'),(6,'RAM','16GB DDR5'),(6,'SSD','512GB NVMe'),
(7,'CPU','AMD Ryzen 5 8645HS'),(7,'GPU','RTX 4050'),(7,'RAM','16GB DDR5'),(7,'SSD','512GB NVMe'),
(8,'CPU','Intel Core i9-14900HX'),(8,'GPU','RTX 4090'),(8,'RAM','64GB DDR5'),(8,'SSD','2TB NVMe'),
(9,'CPU','Intel Core i9-14900HX'),(9,'GPU','RTX 4080'),(9,'RAM','32GB DDR5'),(9,'SSD','1TB NVMe'),
(10,'CPU','Intel Core i5-12450H'),(10,'GPU','RTX 3050'),(10,'RAM','16GB DDR4'),(10,'SSD','512GB NVMe'),
(11,'CPU','AMD Ryzen 7 5800H'),(11,'GPU','RTX 3060'),(11,'RAM','16GB DDR4'),(11,'SSD','512GB NVMe'),
(12,'CPU','Intel Core i7-13650HX'),(12,'GPU','RTX 4060'),(12,'RAM','16GB DDR5'),(12,'SSD','1TB NVMe');

-- CARTS
INSERT INTO carts(id,user_id,user_email,updated_at) VALUES
(1,2,'an@gmail.com','2026-04-10 09:15:00'),
(2,4,'khoi@gmail.com','2026-04-15 16:20:00');

-- CART ITEMS
INSERT INTO cart_items(cart_id,product_id,quantity) VALUES
(1,1,1),(1,2,1),(2,6,2),(2,10,1);

-- ORDERS DATA
INSERT INTO orders(id, code, user_id, user_email, customer_name, customer_phone, shipping_address, total_price, payment_method, payment_status, status, created_at) VALUES
(1,'HD00001',2,'an@gmail.com','Nguyễn Văn An','0911111111','123 Lê Lợi, Quận 1, TP.HCM',42990000,'BANK_TRANSFER','PAID','shipping','2026-04-01 09:30:00'),
(2,'HD00002',3,'binh@gmail.com','Trần Thị Bình','0922222222','45 Nguyễn Huệ, Đà Nẵng',56990000,'MOMO','UNPAID','pending','2026-04-03 14:20:00'),
(3,'HD00003',2,'an@gmail.com','Nguyễn Văn An','0911111111','123 Lê Lợi, Quận 1, TP.HCM',23990000,'COD','UNPAID','done','2026-04-05 19:05:00'),
(4,'HD00004',4,'khoi@gmail.com','Lê Minh Khôi','0933333333','88 Trần Duy Hưng, Hà Nội',24990000,'COD','UNPAID','pending','2026-04-08 10:15:00'),
(5,'HD00005',5,'ha@gmail.com','Phạm Thu Hà','0944444444','22 Cầu Giấy, Hà Nội',35990000,'VNPAY','PAID','done','2026-04-12 20:40:00'),
(6,'HD00006',3,'binh@gmail.com','Trần Thị Bình','0922222222','45 Nguyễn Huệ, Đà Nẵng',48990000,'BANK_TRANSFER','PAID','shipping','2026-04-18 08:10:00'),
(7,'HD00007',4,'khoi@gmail.com','Lê Minh Khôi','0933333333','88 Trần Duy Hưng, Hà Nội',17990000,'COD','UNPAID','cancel','2026-04-21 17:55:00'),
(8,'HD00008',5,'ha@gmail.com','Phạm Thu Hà','0944444444','22 Cầu Giấy, Hà Nội',72990000,'VNPAY','PAID','done','2026-05-02 11:35:00'),
(9,'HD00009',2,'an@gmail.com','Nguyễn Văn An','0911111111','123 Lê Lợi, Quận 1, TP.HCM',32990000,'MOMO','PAID','done','2026-05-05 09:05:00'),
(10,'HD00010',3,'binh@gmail.com','Trần Thị Bình','0922222222','45 Nguyễn Huệ, Đà Nẵng',99990000,'BANK_TRANSFER','PAID','pending','2026-05-10 13:25:00');

-- ORDER ITEMS
INSERT INTO order_items(order_id,product_id,name,image_url,price,quantity,line_total) VALUES
(1,2,'Lenovo Legion 5 Pro 16IRX9','../Images/legion5pro.png',42990000,1,42990000),
(2,3,'Lenovo Legion 7 16IRX9','../Images/productlegion7.jpg',56990000,1,56990000),
(3,7,'Lenovo LOQ 15AHP9','../Images/legion5pro.png',23990000,1,23990000),
(4,6,'Lenovo LOQ 15IRX9','../Images/imgproductslegion5.jpg',24990000,1,24990000),
(5,4,'Lenovo Legion Slim 5 16AHP9','../Images/imgproductslegion5.jpg',35990000,1,35990000),
(6,5,'Lenovo Legion Slim 7 16IRH8','../Images/productlegion7.jpg',48990000,1,48990000),
(7,10,'Lenovo IdeaPad Gaming 3','../Images/imgproductslegion5.jpg',17990000,1,17990000),
(8,9,'Lenovo Legion Pro 7i 16IRX9H','../Images/productlegion7.jpg',72990000,1,72990000),
(9,1,'Lenovo Legion 5 15IRX9','../Images/imgproductslegion5.jpg',32990000,1,32990000),
(10,8,'Lenovo Legion 9i 16IRX9','../Images/productlegion7.jpg',99990000,1,99990000);

-- ORDER STATUS HISTORIES
INSERT INTO order_status_histories(order_id,status,note,created_at) VALUES
(1,'pending','Khách vừa đặt hàng','2026-04-01 09:30:00'),(1,'shipping','Đơn đang giao','2026-04-01 14:00:00'),
(2,'pending','Chờ xác nhận thanh toán','2026-04-03 14:20:00'),
(3,'pending','Đã tiếp nhận đơn','2026-04-05 19:05:00'),(3,'done','Đã giao thành công','2026-04-07 09:00:00'),
(4,'pending','Chờ xử lý','2026-04-08 10:15:00'),
(5,'pending','Đã thanh toán VNPay','2026-04-12 20:40:00'),(5,'done','Hoàn thành đơn hàng','2026-04-14 18:00:00'),
(6,'shipping','Đang giao cho khách','2026-04-18 10:00:00'),
(7,'cancel','Khách hủy đơn','2026-04-21 18:30:00'),
(8,'done','Đã bàn giao máy','2026-05-04 15:00:00'),
(9,'done','Đã giao thành công','2026-05-06 11:00:00'),
(10,'pending','Đơn giá trị cao cần xác nhận','2026-05-10 13:25:00');

-- SERVICE REQUESTS DATA
INSERT INTO laptop_service_requests(id, code, user_id, user_email, customer_name, customer_phone, device_name, brand, service_type, issue_description, device_condition, estimated_cost, technician_note, status, appointment_date, created_at, updated_at) VALUES
(1,'DV00001',2,'an@gmail.com','Nguyễn Văn An','0911111111','Lenovo Legion 5','Lenovo','maintenance','Máy nóng, quạt kêu to','Còn nguyên tem, trầy nhẹ nắp A',250000,'Đã vệ sinh, thay keo tản nhiệt','done','2026-04-11 09:00:00','2026-04-10 08:30:00','2026-04-11 11:30:00'),
(2,'DV00002',3,'binh@gmail.com','Trần Thị Bình','0922222222','Legion 7','Lenovo','repair','Không lên màn hình','Máy có sạc, đèn nguồn sáng',0,'Cần kiểm tra main/màn','processing','2026-04-15 14:00:00','2026-04-14 10:20:00','2026-04-14 10:20:00'),
(3,'DV00003',4,'khoi@gmail.com','Lê Minh Khôi','0933333333','LOQ 15','Lenovo','upgrade','Nâng RAM lên 32GB','Máy hoạt động bình thường',1200000,'Chờ linh kiện RAM DDR5','received','2026-04-20 10:00:00','2026-04-19 16:00:00','2026-04-19 16:00:00'),
(4,'DV00004',5,'ha@gmail.com','Phạm Thu Hà','0944444444','Legion Slim 5','Lenovo','repair','Bàn phím chập chờn','Máy còn bảo hành',0,'Tiếp nhận bảo hành','received','2026-05-03 09:30:00','2026-05-02 17:15:00','2026-05-02 17:15:00');

-- RESET AUTO_INCREMENT
ALTER TABLE users AUTO_INCREMENT = 20;
ALTER TABLE products AUTO_INCREMENT = 100;
ALTER TABLE product_specs AUTO_INCREMENT = 1000;
ALTER TABLE carts AUTO_INCREMENT = 20;
ALTER TABLE cart_items AUTO_INCREMENT = 100;
ALTER TABLE orders AUTO_INCREMENT = 100;
ALTER TABLE order_items AUTO_INCREMENT = 1000;
ALTER TABLE order_status_histories AUTO_INCREMENT = 1000;
ALTER TABLE laptop_service_requests AUTO_INCREMENT = 100;

SET FOREIGN_KEY_CHECKS = 1;

SHOW TABLES;

-- BACKUP / IMPORT NOTES
-- Backup:
-- mysqldump -u root -p legionshop > backup_legionshop.sql
-- Import:
-- mysql -u root -p legionshop < backup_legionshop.sql
