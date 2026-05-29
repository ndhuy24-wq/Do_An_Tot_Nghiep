README TRIỂN KHAI HỆ THỐNG LEGIONSHOP
LegionShop – Website Thương Mại Điện Tử Laptop Gaming
Giới thiệu

LegionShop là website thương mại điện tử chuyên bán laptop gaming và cung cấp dịch vụ hỗ trợ kỹ thuật. Hệ thống được xây dựng với

Frontend HTML, CSS, JavaScript
Backend Spring Boot
Database MySQL
1. Yêu cầu hệ thống
Phần mềm cần cài đặt
Phần mềm	Phiên bản đề xuất
Java JDK	17
MySQL	8.x
Maven	3.8+
IntelliJ IDEA	Mới nhất
VS Code	Mới nhất
XAMPP (tuỳ chọn)	Mới nhất
2. Clone project
git clone repository-url

Hoặc giải nén file source code.

3. Cấu hình database
Bước 1 Tạo database
CREATE DATABASE legion_shop;
Bước 2 Import dữ liệu

Import file

dbdatabase.sql
4. Chạy Backend
Di chuyển vào thư mục backend
cd legion-shop-backend
Cấu hình application.properties
spring.datasource.url=jdbcmysqllocalhost3306legion_shop
spring.datasource.username=root
spring.datasource.password=123456
spring.jpa.hibernate.ddl-auto=update
Chạy project
mvn spring-bootrun

Backend chạy tại

httplocalhost8080
5. Chạy Frontend
Mở project bằng VS Code

Chạy Live Server với file

HTMLhome.html

Hoặc

HTMLmain.html

Frontend sẽ kết nối tới backend thông qua API.

6. Tài khoản mẫu
Admin
Email admin@gmail.com
Password admin123
User
Email user@gmail.com
Password user123
7. Chức năng chính
Người dùng
Đăng ký  đăng nhập
Xem sản phẩm
Tìm kiếm sản phẩm
Thêm giỏ hàng
Đặt hàng
Thanh toán
Theo dõi đơn hàng
Gửi yêu cầu dịch vụ
Quản trị viên
Quản lý sản phẩm
Quản lý tài khoản
Quản lý đơn hàng
Quản lý yêu cầu dịch vụ
Quản lý trạng thái thanh toán
8. API chính
API	Chức năng
apiauth	Xác thực
apiproducts	Quản lý sản phẩm
apiorders	Quản lý đơn hàng
apiusers	Quản lý người dùng
apiservice-requests	Yêu cầu dịch vụ
9. Công nghệ sử dụng
Thành phần	Công nghệ
Frontend	HTML, CSS, JavaScript
Backend	Spring Boot
Database	MySQL
ORM	Spring Data JPA
Build Tool	Maven
Authentication	JWT
10. Hướng phát triển
Tích hợp thanh toán online thực tế.
Triển khai Docker.
Tối ưu giao diện responsive.
Tích hợp AI chatbot hỗ trợ khách hàng.
Thêm chức năng đánh giá sản phẩm.
11. Kết luận

Hệ thống LegionShop đáp ứng đầy đủ các chức năng của một website thương mại điện tử cơ bản, hỗ trợ quản lý bán hàng, thanh toán và dịch vụ khách hàng. Kiến trúc tách biệt Frontend – Backend giúp hệ thống dễ mở rộng và bảo trì trong tương lai.