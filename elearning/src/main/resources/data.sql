-- DỮ LIỆU MẪU (MOCK DATA) ĐẦY ĐỦ CHO HỆ THỐNG E-LEARNING
-- Mật khẩu cho tất cả tài khoản là: 123456 (đã được hash bcrypt)

-- ==========================================
-- 1. FILES (Ảnh đại diện, Thumbnail, Video, Tài liệu)
-- ==========================================
INSERT INTO elearning.files (file_name, file_path, file_type, file_size) VALUES
('avatar_admin.png', 'uploads/2f1a6cdb-7657-4277-8d50-0b95b3739e03.png', 'image/png', 1048576),
('avatar_student1.png', 'uploads/3cecc00d-8df0-4aea-a0f1-b3b71ea83be1.png', 'image/png', 5033164),
('avatar_instructor1.png', 'uploads/02a2ec0b-0d5c-4b18-b1fa-684393ca15fb.png', 'image/png', 2306867),
('thumb_java.png', 'uploads/a9ed30cf-f52a-48ef-bd3e-69181b48111e.png', 'image/png', 2306867),
('thumb_react.png', 'uploads/643af909-a7ae-43b9-934b-18fc789a6cb3.png', 'image/png', 4194304),
('video_course.mp4', 'uploads/9442720a-105f-4c5c-80d4-f7961bee9c55.mp4', 'video/mp4', 15000000),
('document_course.pdf', 'uploads/5ef016a7-3bd9-4de9-b900-581c603084d3.pdf', 'application/pdf', 5000000);

-- ==========================================
-- 2. USERS
-- ==========================================
INSERT INTO elearning.users (full_name, email, password_hash, avatar_file_id, phone, date_of_birth, role, status) VALUES
('Hệ Thống Quản Trị', 'superadmin@gmail.com', '$2b$12$Zutn2PNNPe7RRNpi3XQxaekoQKWwe8pt87q6d29pl.jclngkfFMs2', 1, '0900000000', '1980-01-01', 'ROLE_SUPER_ADMIN', true),
('Admin EduFlow', 'admin@gmail.com', '$2a$10$XzeG4w4SvJBFlXRU1UVsM.N7mgmTRcJuTAQGqrFw.wBQFWHpqIz9C', 1, '0901000001', '1990-01-01', 'ROLE_ADMIN', true),
('Nguyễn Trọng Khoa', 'khoa.nguyen@gmail.com', '$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1gioaWPn4t1KsnmG', 2, '0901222333', '1998-02-15', 'ROLE_STUDENT', true),
('Trần Thị Thảo', 'thao.tran@gmail.com', '$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1gioaWPn4t1KsnmG', null, '0901444555', '2000-05-20', 'ROLE_STUDENT', true),
('Lê Minh Tâm', 'tam.le@gmail.com', '$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1gioaWPn4t1KsnmG', null, '0901666777', '2001-10-10', 'ROLE_STUDENT', false),
('Phạm Quang Khải', 'khai.pham@gmail.com', '$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1gioaWPn4t1KsnmG', null, '0901888999', '1999-12-12', 'ROLE_STUDENT', true),
('Đặng Lê Nguyên Vũ', 'vu.dang@gmail.com', '$2b$12$1tn3I8avZL/NsKJwV.ICCuSnuXYFZ9hdxBwtPwOQ8TWoKpH/XeEQ6', 3, '0901000006', '1985-08-08', 'ROLE_INSTRUCTOR', true),
('Võ Công Trí', 'tri.vo@gmail.com', '$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1gioaWPn4t1KsnmG', null, '0901000007', '1988-03-03', 'ROLE_INSTRUCTOR', true),
('Hoàng Anh Tú', 'tu.hoang@gmail.com', '$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1gioaWPn4t1KsnmG', null, '0901123123', '2001-07-07', 'ROLE_STUDENT', true),
('Vũ Thị Bích Ngọc', 'ngoc.vu@gmail.com', '$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1gioaWPn4t1KsnmG', null, '0901456456', '2002-09-09', 'ROLE_STUDENT', true),
('Đinh Quang Hiếu', 'hieu.dinh@gmail.com', '$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1gioaWPn4t1KsnmG', null, '0901789789', '1997-11-11', 'ROLE_STUDENT', true);

-- ==========================================
-- 3. CATEGORIES
-- ==========================================
INSERT INTO elearning.categories (category_name, description) VALUES
('Lập trình Web', 'Trang bị kiến thức toàn diện về Frontend (React, Vue) và Backend (NodeJS, Java, PHP). Giúp bạn tự tin xây dựng một website hoàn chỉnh từ con số 0, áp dụng các best practices của ngành công nghiệp phần mềm.'),
('Lập trình Di động', 'Khóa học hướng dẫn lập trình ứng dụng di động cho cả nền tảng iOS và Android sử dụng các framework phổ biến như Flutter, React Native, Swift. Tự tin ứng tuyển vào các công ty phát triển App.'),
('Khoa học Dữ liệu & AI', 'Khám phá thế giới của Data Science, Machine Learning và Trí tuệ nhân tạo (AI). Phân tích dữ liệu bằng Python, SQL và các thư viện chuyên sâu, ứng dụng AI để giải quyết các bài toán thực tiễn.'),
('Thiết kế Đồ họa (UI/UX)', 'Hướng dẫn tư duy thiết kế trải nghiệm người dùng (UX) và giao diện người dùng (UI). Thành thạo các công cụ thiết kế hàng đầu như Figma, Photoshop, Illustrator, chuẩn bị portfolio ấn tượng.'),
('Kỹ năng mềm', 'Khóa học phát triển kỹ năng thuyết trình, giao tiếp, quản lý thời gian, và giải quyết vấn đề hiệu quả dành cho dân công sở và sinh viên, tạo đà thăng tiến trong sự nghiệp.'),
('Digital Marketing', 'Kiến thức thực chiến về SEO, Google Ads, Facebook Ads và các chiến lược tiếp thị kỹ thuật số để đưa sản phẩm tiếp cận đúng khách hàng mục tiêu, bùng nổ doanh số bán hàng.');

-- ==========================================
-- 4. COURSES
-- ==========================================
INSERT INTO elearning.courses (title, description, what_you_will_learn, thumbnail_file_id, price, is_free, status, instructor_id, category_id) VALUES
('Khóa học Java Spring Boot Thực chiến: Xây dựng RESTful API Tầm Cỡ Doanh Nghiệp', 'Khóa học này được thiết kế theo tiêu chuẩn công nghiệp mới nhất. Đi từ cơ bản đến nâng cao về Spring Boot 3, bạn sẽ học cách kiến trúc một dự án thật, áp dụng các Design Patterns thông dụng, bảo mật với Spring Security & JWT, tối ưu hóa truy vấn với Spring Data JPA, và đóng gói ứng dụng bằng Docker. Kết thúc khóa học, bạn sẽ có một project thực tế hoàn chỉnh, đủ tiêu chuẩn để thuyết phục bất kỳ nhà tuyển dụng khó tính nào.', 'Hiểu rõ các khái niệm cốt lõi của Spring Boot.\nBiết cách thiết kế RESTful API chuẩn.\nThành thạo Spring Security và JWT.\nĐóng gói ứng dụng với Docker.', 4, 1200000, false, 'APPROVED', 7, 1),
('Làm chủ ReactJS & Redux Toolkit: Từ Zero đến Hero', 'Đây là khóa học chuyên sâu nhất về ReactJS dành cho người mới bắt đầu hoặc muốn củng cố nền tảng vững chắc. Nội dung bao gồm kiến thức từ component, state, props, đến các khái niệm cốt lõi như React Hooks (useState, useEffect, useContext, useMemo). Hơn thế nữa, bạn sẽ được học Redux Toolkit để quản lý state toàn cục, và cách giao tiếp với RESTful API để làm ra một ứng dụng Thương mại điện tử thực tế.', 'Hiểu rõ các khái niệm cốt lõi và nguyên lý hoạt động của ReactJS.\nBiết cách áp dụng kiến thức vào các dự án thực tế.\nNắm bắt được các công cụ và quy trình làm việc chuẩn.\nSử dụng Redux Toolkit một cách thành thạo.\nTự tin hơn trong các bài kiểm tra và phỏng vấn kỹ thuật.\nNhận chứng chỉ hoàn thành khóa học từ hệ thống.', 5, 800000, false, 'APPROVED', 7, 1),
('Phân tích Dữ liệu Data Science & Machine Learning với Python', 'Bước chân vào ngành Khoa học dữ liệu với một giáo trình bài bản. Bạn sẽ được học cách thu thập, làm sạch dữ liệu (Data Cleansing), trực quan hóa dữ liệu (Data Visualization) đẹp mắt bằng Matplotlib & Seaborn. Nâng cao hơn, khóa học hướng dẫn xây dựng các mô hình dự đoán cơ bản (Regression, Classification) sử dụng Scikit-Learn. Hỗ trợ 1-1 trong suốt khóa học.', 'Hiểu quy trình xử lý dữ liệu chuẩn.\nTrực quan hóa dữ liệu đẹp mắt và chuyên nghiệp.\nXây dựng mô hình Machine Learning cơ bản.\nSử dụng thành thạo Python và các thư viện liên quan.', null, 1500000, false, 'APPROVED', 8, 3),
('Thiết kế UI/UX Chuyên nghiệp với Figma 2024: Quy Trình Đỉnh Cao', 'Figma đang là công cụ thống trị ngành thiết kế Web/App. Khóa học này không chỉ dạy cách sử dụng công cụ, mà còn đào tạo tư duy thiết kế lấy người dùng làm trung tâm (User-Centered Design). Cung cấp quy trình thiết kế chuẩn từ Wireframe, Mockup, Design System đến Prototype tương tác cao. Cam kết sau khóa học bạn sẽ có thể tự tay làm một Portfolio chuẩn quốc tế.', 'Sử dụng thành thạo Figma.\nHiểu và áp dụng quy trình UI/UX chuẩn.\nTạo Prototype tương tác cao.\nXây dựng Portfolio chuyên nghiệp.', null, 500000, false, 'APPROVED', 8, 4),
('Kỹ Năng Giao Tiếp và Thuyết Trình Thu Hút Tại Nơi Công Sở', 'Làm sao để sếp hiểu đúng ý bạn? Làm sao để đồng nghiệp hợp tác vui vẻ và khách hàng bị thuyết phục? Khóa học ngắn hạn này cung cấp cho bạn những thủ thuật tâm lý, kỹ năng giao tiếp linh hoạt, cách viết email chuyên nghiệp, và đặc biệt là kỹ thuật kể chuyện (Storytelling) để trình bày ý tưởng một cách lôi cuốn nhất.', 'Cải thiện kỹ năng giao tiếp nơi công sở.\nThuyết trình lôi cuốn bằng Storytelling.\nBiết cách làm việc nhóm hiệu quả.\nViết email chuyên nghiệp.', null, 0, true, 'APPROVED', 7, 5),
('Kiến trúc Microservices với Spring Cloud, Kafka & Docker', 'Khóa học siêu nâng cao dành cho các lập trình viên Java muốn vươn lên tầm Senior/Architect. Hướng dẫn chi tiết cách tách hệ thống Monolith cồng kềnh thành các Microservices linh hoạt. Học cách quản lý cấu hình tập trung (Config Server), Service Discovery (Eureka), phân tải qua API Gateway, và xử lý sự kiện bất đồng bộ bằng Apache Kafka. Toàn bộ hạ tầng sẽ được triển khai lên Docker.', 'Tách hệ thống Monolith thành Microservices.\nSử dụng Spring Cloud hiệu quả.\nỨng dụng Kafka cho xử lý bất đồng bộ.\nTriển khai toàn bộ với Docker.', null, 2500000, false, 'PENDING', 7, 1);

-- ==========================================
-- 4.5 SECTIONS
-- ==========================================
INSERT INTO elearning.sections (course_id, title, section_order) VALUES
(1, 'Chương 1: Tổng quan về Khóa học và Cài đặt môi trường', 1),
(1, 'Chương 2: Kiến trúc IoC, Bean và Dependency Injection', 2),
(1, 'Chương 3: Spring Data JPA và Thao tác Cơ sở dữ liệu', 3),
(1, 'Chương 4: Xây dựng RESTful API Chuẩn REST', 4),
(1, 'Chương 5: Bảo mật Hệ thống với Spring Security & JWT', 5),
(2, 'Chương 1: Khởi động với React và Vite', 1),
(2, 'Chương 2: Phân tích Component, State và Props', 2),
(2, 'Chương 3: Sức mạnh của React Hooks & Lifecycle', 3),
(2, 'Chương 4: Quản lý State Toàn cục với Redux Toolkit', 4),
(3, 'Chương 1: Môi trường Anaconda, Jupyter và Nhập môn Python', 1),
(3, 'Chương 2: Phân tích mảng đa chiều với NumPy', 2),
(3, 'Chương 3: Làm sạch và Biến đổi dữ liệu với Pandas', 3),
(4, 'Chương 1: Bắt đầu với Figma - Giao diện và Công cụ cơ bản', 1),
(4, 'Chương 2: Xây dựng Design System chuyên nghiệp', 2),
(4, 'Chương 3: Master Auto Layout và Components', 3),
(5, 'Chương 1: Nền tảng giao tiếp hiệu quả', 1),
(5, 'Chương 2: Viết Email và Thuyết trình công sở', 2),
(6, 'Chương 1: Từ Monolith đến Microservices', 1),
(6, 'Chương 2: Spring Cloud và Eureka', 2),
(6, 'Chương 3: API Gateway và Kafka', 3);

-- ==========================================
-- 5. LESSONS
-- ==========================================
INSERT INTO elearning.lessons (section_id, title, lesson_type, description, lesson_order) VALUES
(1, 'Bài 1: Giới thiệu khóa học & Định hướng nghề nghiệp Backend', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 1', 1),
(1, 'Bài 2: Hướng dẫn cài đặt JDK, IntelliJ IDEA và Postman', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 2', 2),
(1, 'Bài 3: Tài liệu: Quy tắc Coding Convention của Google dành cho Java', 'DOCUMENT', 'Mô tả chi tiết nội dung của Bài 3', 3),
(2, 'Bài 1: Tìm hiểu sâu về Spring IoC Container', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 1', 1),
(2, 'Bài 2: Phân biệt @Component, @Service, @Repository, @Controller', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 2', 2),
(2, 'Bài 3: Dependency Injection (DI) qua Constructor và Field', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 3', 3),
(2, 'Bài 4: Bài tập: Trắc nghiệm kiến thức cốt lõi Spring IoC & DI', 'QUIZ', 'Mô tả chi tiết nội dung của Bài 4', 4),
(3, 'Bài 1: Cấu hình kết nối MySQL và application.yml', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 1', 1),
(3, 'Bài 2: Mapping Entity và Các quan hệ 1-N, N-N', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 2', 2),
(3, 'Bài 3: Viết Custom Query bằng @Query và JPQL', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 3', 3),
(3, 'Bài 4: Bài tập: Kiểm tra kiến thức JPA', 'QUIZ', 'Mô tả chi tiết nội dung của Bài 4', 4),
(4, 'Bài 1: Hiểu đúng về REST và các phương thức HTTP', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 1', 1),
(4, 'Bài 2: Xây dựng CRUD cho Product Entity', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 2', 2),
(4, 'Bài 3: Tài liệu: HTTP Status Code Cheat Sheet', 'DOCUMENT', 'Mô tả chi tiết nội dung của Bài 3', 3),
(5, 'Bài 1: Cơ chế Authentication và Authorization', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 1', 1),
(5, 'Bài 2: Cài đặt JWT Filter và tạo Token', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 2', 2),
(5, 'Bài 3: Bài tập cuối khóa: Tổng hợp Spring Security', 'QUIZ', 'Mô tả chi tiết nội dung của Bài 3', 3),
(6, 'Bài 1: Lịch sử của ReactJS và Single Page Application (SPA)', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 1', 1),
(6, 'Bài 2: Cài đặt NodeJS và Khởi tạo dự án siêu tốc với Vite', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 2', 2),
(6, 'Bài 3: Tài liệu: Cheat sheet 20 câu lệnh NPM/Yarn thường dùng', 'DOCUMENT', 'Mô tả chi tiết nội dung của Bài 3', 3),
(7, 'Bài 1: Tư duy chia nhỏ Component', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 1', 1),
(7, 'Bài 2: Truyền dữ liệu giữa các Component bằng Props', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 2', 2),
(7, 'Bài 3: Quản lý dữ liệu nội bộ với useState', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 3', 3),
(7, 'Bài 4: Trắc nghiệm: Nền tảng React', 'QUIZ', 'Mô tả chi tiết nội dung của Bài 4', 4),
(8, 'Bài 1: Sử dụng useEffect để gọi API', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 1', 1),
(8, 'Bài 2: Tối ưu hóa hiệu suất với useMemo và useCallback', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 2', 2),
(8, 'Bài 3: Tài liệu: Các lỗi thường gặp khi dùng useEffect', 'DOCUMENT', 'Mô tả chi tiết nội dung của Bài 3', 3),
(9, 'Bài 1: Redux cơ bản: Action, Reducer, Store', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 1', 1),
(9, 'Bài 2: Cài đặt Redux Toolkit và tạo Slice', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 2', 2),
(9, 'Bài 3: Bài tập: Kiểm tra kiến thức Redux', 'QUIZ', 'Mô tả chi tiết nội dung của Bài 3', 3),
(10, 'Bài 1: Cài đặt Anaconda và Jupyter Notebook', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 1', 1),
(10, 'Bài 2: Các cấu trúc dữ liệu cốt lõi trong Python', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 2', 2),
(10, 'Bài 3: Tài liệu: Phím tắt Jupyter Notebook', 'DOCUMENT', 'Mô tả chi tiết nội dung của Bài 3', 3),
(11, 'Bài 1: Khởi tạo NumPy Array và Broadcasting', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 1', 1),
(11, 'Bài 2: Các phép toán ma trận cơ bản', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 2', 2),
(11, 'Bài 3: Trắc nghiệm: NumPy', 'QUIZ', 'Mô tả chi tiết nội dung của Bài 3', 3),
(12, 'Bài 1: DataFrame và Series', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 1', 1),
(12, 'Bài 2: Xử lý Missing Data', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 2', 2),
(12, 'Bài 3: Group By và Pivot Table', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 3', 3),
(12, 'Bài 4: Bài tập tổng hợp Pandas', 'QUIZ', 'Mô tả chi tiết nội dung của Bài 4', 4),
(13, 'Bài 1: Khám phá giao diện Figma', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 1', 1),
(13, 'Bài 2: Sự khác biệt giữa Frame và Group', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 2', 2),
(13, 'Bài 3: Tài liệu: Nguyên lý thiết kế cơ bản', 'DOCUMENT', 'Mô tả chi tiết nội dung của Bài 3', 3),
(14, 'Bài 1: Tạo Local Styles: Màu sắc và Typography', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 1', 1),
(14, 'Bài 2: Thiết lập Grid System cho Website', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 2', 2),
(14, 'Bài 3: Trắc nghiệm: Design System', 'QUIZ', 'Mô tả chi tiết nội dung của Bài 3', 3),
(15, 'Bài 1: Sức mạnh của Auto Layout', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 1', 1),
(15, 'Bài 2: Tạo Master Component và Variants', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 2', 2),
(15, 'Bài 3: Xây dựng nguyên mẫu Prototype tương tác', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 3', 3),
(15, 'Bài 4: Bài tập cuối khóa: Figma Mastery', 'QUIZ', 'Mô tả chi tiết nội dung của Bài 4', 4),
(16, 'Bài 1: Mô hình giao tiếp và rào cản thường gặp', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 1', 1),
(16, 'Bài 2: Kỹ năng lắng nghe thấu cảm', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 2', 2),
(16, 'Bài 3: Tài liệu: 5 nguyên tắc vàng trong ứng xử', 'DOCUMENT', 'Mô tả chi tiết nội dung của Bài 3', 3),
(17, 'Bài 1: Công thức viết Email chuyên nghiệp', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 1', 1),
(17, 'Bài 2: Nghệ thuật kể chuyện (Storytelling) trong thuyết trình', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 2', 2),
(17, 'Bài 3: Kiểm tra kỹ năng mềm', 'QUIZ', 'Mô tả chi tiết nội dung của Bài 3', 3),
(18, 'Bài 1: Nhược điểm của kiến trúc Monolith', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 1', 1),
(18, 'Bài 2: Tổng quan kiến trúc Microservices', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 2', 2),
(18, 'Bài 3: Tài liệu: Microservices Pattern', 'DOCUMENT', 'Mô tả chi tiết nội dung của Bài 3', 3),
(19, 'Bài 1: Cấu hình Service Discovery với Eureka', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 1', 1),
(19, 'Bài 2: Kết nối các services bằng FeignClient', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 2', 2),
(19, 'Bài 3: Trắc nghiệm: Spring Cloud cơ bản', 'QUIZ', 'Mô tả chi tiết nội dung của Bài 3', 3),
(20, 'Bài 1: Định tuyến request qua Spring Cloud Gateway', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 1', 1),
(20, 'Bài 2: Xử lý bất đồng bộ với Apache Kafka', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 2', 2),
(20, 'Bài 3: Sử dụng Docker Compose để chạy toàn bộ hệ thống', 'VIDEO', 'Mô tả chi tiết nội dung của Bài 3', 3),
(20, 'Bài 4: Bài kiểm tra cuối khóa: Kiến trúc sư phần mềm', 'QUIZ', 'Mô tả chi tiết nội dung của Bài 4', 4);

-- ==========================================
-- 6. VIDEOS & READING MATERIALS & ASSETS
-- ==========================================
INSERT INTO elearning.videos (lesson_id, video_type, video_file_id, duration) VALUES
(1, 'UPLOAD', 6, 1257),
(2, 'UPLOAD', 6, 855),
(4, 'UPLOAD', 6, 1363),
(5, 'UPLOAD', 6, 452),
(6, 'UPLOAD', 6, 1085),
(8, 'UPLOAD', 6, 677),
(9, 'UPLOAD', 6, 543),
(10, 'UPLOAD', 6, 1039),
(12, 'UPLOAD', 6, 953),
(13, 'UPLOAD', 6, 1170),
(15, 'UPLOAD', 6, 1202),
(16, 'UPLOAD', 6, 948),
(18, 'UPLOAD', 6, 1263),
(19, 'UPLOAD', 6, 1044),
(21, 'UPLOAD', 6, 936),
(22, 'UPLOAD', 6, 710),
(23, 'UPLOAD', 6, 987),
(25, 'UPLOAD', 6, 443),
(26, 'UPLOAD', 6, 1418),
(28, 'UPLOAD', 6, 1453),
(29, 'UPLOAD', 6, 942),
(31, 'UPLOAD', 6, 633),
(32, 'UPLOAD', 6, 578),
(34, 'UPLOAD', 6, 1075),
(35, 'UPLOAD', 6, 1208),
(37, 'UPLOAD', 6, 688),
(38, 'UPLOAD', 6, 1371),
(39, 'UPLOAD', 6, 1037),
(41, 'UPLOAD', 6, 1232),
(42, 'UPLOAD', 6, 766),
(44, 'UPLOAD', 6, 708),
(45, 'UPLOAD', 6, 689),
(47, 'UPLOAD', 6, 1293),
(48, 'UPLOAD', 6, 441),
(49, 'UPLOAD', 6, 1121),
(51, 'UPLOAD', 6, 1225),
(52, 'UPLOAD', 6, 763),
(54, 'UPLOAD', 6, 471),
(55, 'UPLOAD', 6, 913),
(57, 'UPLOAD', 6, 566),
(58, 'UPLOAD', 6, 870),
(60, 'UPLOAD', 6, 565),
(61, 'UPLOAD', 6, 906),
(63, 'UPLOAD', 6, 852),
(64, 'UPLOAD', 6, 1473),
(65, 'UPLOAD', 6, 1194);

INSERT INTO elearning.lesson_assets (lesson_id, file_id) VALUES
(3, 7),
(14, 7),
(20, 7),
(27, 7),
(33, 7),
(43, 7),
(53, 7),
(59, 7);

INSERT INTO elearning.reading_materials (lesson_id, title, content_html) VALUES
(3, 'Tài liệu hướng dẫn chuyên sâu', '<h3>Nội dung tài liệu</h3><p>Đây là nội dung tài liệu chi tiết được viết dưới định dạng HTML.</p>'),
(14, 'Tài liệu hướng dẫn chuyên sâu', '<h3>Nội dung tài liệu</h3><p>Đây là nội dung tài liệu chi tiết được viết dưới định dạng HTML.</p>'),
(20, 'Tài liệu hướng dẫn chuyên sâu', '<h3>Nội dung tài liệu</h3><p>Đây là nội dung tài liệu chi tiết được viết dưới định dạng HTML.</p>'),
(27, 'Tài liệu hướng dẫn chuyên sâu', '<h3>Nội dung tài liệu</h3><p>Đây là nội dung tài liệu chi tiết được viết dưới định dạng HTML.</p>'),
(33, 'Tài liệu hướng dẫn chuyên sâu', '<h3>Nội dung tài liệu</h3><p>Đây là nội dung tài liệu chi tiết được viết dưới định dạng HTML.</p>'),
(43, 'Tài liệu hướng dẫn chuyên sâu', '<h3>Nội dung tài liệu</h3><p>Đây là nội dung tài liệu chi tiết được viết dưới định dạng HTML.</p>'),
(53, 'Tài liệu hướng dẫn chuyên sâu', '<h3>Nội dung tài liệu</h3><p>Đây là nội dung tài liệu chi tiết được viết dưới định dạng HTML.</p>'),
(59, 'Tài liệu hướng dẫn chuyên sâu', '<h3>Nội dung tài liệu</h3><p>Đây là nội dung tài liệu chi tiết được viết dưới định dạng HTML.</p>');

-- ==========================================
-- 7. QUIZZES, QUESTIONS, ANSWERS
-- ==========================================
INSERT INTO elearning.quizzes (lesson_id, title, passing_score) VALUES
(7, 'Bài tập: Trắc nghiệm kiến thức cốt lõi Spring IoC & DI', 70),
(11, 'Bài tập: Kiểm tra kiến thức JPA', 70),
(17, 'Bài tập cuối khóa: Tổng hợp Spring Security', 70),
(24, 'Trắc nghiệm: Nền tảng React', 70),
(30, 'Bài tập: Kiểm tra kiến thức Redux', 70),
(36, 'Trắc nghiệm: NumPy', 70),
(40, 'Bài tập tổng hợp Pandas', 70),
(46, 'Trắc nghiệm: Design System', 70),
(50, 'Bài tập cuối khóa: Figma Mastery', 70),
(56, 'Kiểm tra kỹ năng mềm', 70),
(62, 'Trắc nghiệm: Spring Cloud cơ bản', 70),
(66, 'Bài kiểm tra cuối khóa: Kiến trúc sư phần mềm', 70);

INSERT INTO elearning.questions (quiz_id, question_text) VALUES
(1, 'Thành phần nào đảm nhiệm việc khởi tạo, quản lý vòng đời Bean?'),
(1, 'Annotation nào để tiêm phụ thuộc?'),
(2, 'Annotation nào đánh dấu một class là Entity?'),
(2, 'Phương thức lưu dữ liệu mặc định của JpaRepository là gì?'),
(3, 'Trong JWT, phần nào chứa thông tin Payload?'),
(3, 'Interface nào của Spring Security trả về UserDetails?'),
(4, 'ReactJS được phát triển bởi công ty nào?'),
(4, 'Đặc điểm nào dưới đây là của Props?'),
(5, 'Hàm nào trong Redux Toolkit dùng để tạo ra Reducer và Action tự động?'),
(5, 'Hook nào dùng để lấy state từ Redux store?'),
(6, 'Hàm nào tạo mảng toàn số 0 trong NumPy?'),
(6, 'Thuộc tính nào trả về kích thước các chiều của mảng?'),
(7, 'Hàm nào dùng để đọc file CSV trong Pandas?'),
(7, 'Để xóa các hàng chứa giá trị NaN, dùng hàm nào?'),
(8, 'Tại sao nên dùng Local Styles thay vì đổ màu thủ công?'),
(8, 'Khung lưới (Grid) phổ biến nhất cho Desktop thường có bao nhiêu cột?'),
(9, 'Phím tắt để thêm Auto Layout là gì?'),
(9, 'Variant trong Figma dùng để làm gì?'),
(10, 'Thành phần nào không thể thiếu trong một Email công việc?'),
(10, 'Yếu tố quan trọng nhất khi thuyết trình là gì?'),
(11, 'Eureka Server đóng vai trò gì trong kiến trúc Microservices?'),
(11, 'Annotation nào để kích hoạt Eureka Client?'),
(12, 'API Gateway thường đảm nhận công việc gì?'),
(12, 'Trong Kafka, Topic là gì?');

INSERT INTO elearning.answers (question_id, answer_text, is_correct) VALUES
(1, 'Spring IoC Container', true),
(1, 'Spring MVC', false),
(1, 'Spring Boot', false),
(1, 'Hibernate', false),
(2, '@Autowired', true),
(2, '@Inject', false),
(2, '@Entity', false),
(2, '@Value', false),
(3, '@Entity', true),
(3, '@Table', false),
(3, '@Column', false),
(3, '@Id', false),
(4, 'save()', true),
(4, 'persist()', false),
(4, 'insert()', false),
(4, 'update()', false),
(5, 'Phần thứ 2', true),
(5, 'Phần thứ 1', false),
(5, 'Phần thứ 3', false),
(5, 'Header', false),
(6, 'UserDetailsService', true),
(6, 'AuthenticationManager', false),
(6, 'SecurityContext', false),
(6, 'PasswordEncoder', false),
(7, 'Meta (Facebook)', true),
(7, 'Google', false),
(7, 'Microsoft', false),
(7, 'Twitter', false),
(8, 'Read-only (chỉ đọc)', true),
(8, 'Có thể bị thay đổi bởi Component con', false),
(8, 'Chỉ dùng trong Class Component', false),
(8, 'Thay thế cho State', false),
(9, 'createSlice', true),
(9, 'createStore', false),
(9, 'createAction', false),
(9, 'createReducer', false),
(10, 'useSelector', true),
(10, 'useDispatch', false),
(10, 'useStore', false),
(10, 'useContext', false),
(11, 'np.zeros()', true),
(11, 'np.null()', false),
(11, 'np.empty()', false),
(11, 'np.ones()', false),
(12, 'shape', true),
(12, 'size', false),
(12, 'ndim', false),
(12, 'len', false),
(13, 'pd.read_csv()', true),
(13, 'pd.open_csv()', false),
(13, 'pd.load_csv()', false),
(13, 'pd.get_csv()', false),
(14, 'dropna()', true),
(14, 'fillna()', false),
(14, 'remove_nan()', false),
(14, 'delete_null()', false),
(15, 'Để dễ dàng đổi màu hàng loạt khi cần', true),
(15, 'Để file thiết kế nhẹ hơn', false),
(15, 'Để xuất file nhanh hơn', false),
(15, 'Không có tác dụng đặc biệt', false),
(16, '12 cột', true),
(16, '8 cột', false),
(16, '16 cột', false),
(16, '24 cột', false),
(17, 'Shift + A', true),
(17, 'Ctrl + A', false),
(17, 'Alt + A', false),
(17, 'Space + A', false),
(18, 'Gộp các trạng thái của Component lại với nhau', true),
(18, 'Đổi màu giao diện', false),
(18, 'Tạo animation tự động', false),
(18, 'Xuất file thiết kế', false),
(19, 'Tiêu đề (Subject) rõ ràng', true),
(19, 'Biểu tượng cảm xúc (Emoji)', false),
(19, 'File đính kèm dung lượng lớn', false),
(19, 'Câu nói đùa để giải tỏa căng thẳng', false),
(20, 'Hiểu rõ đối tượng khán giả', true),
(20, 'Slide thiết kế thật nhiều màu sắc', false),
(20, 'Nói thật nhanh để kịp thời gian', false),
(20, 'Đọc lại chữ trên Slide', false),
(21, 'Đăng ký và khám phá dịch vụ (Service Discovery)', true),
(21, 'Cân bằng tải (Load Balancer)', false),
(21, 'Xác thực người dùng (Auth Server)', false),
(21, 'Lưu trữ dữ liệu tập trung', false),
(22, '@EnableDiscoveryClient', true),
(22, '@EnableEurekaServer', false),
(22, '@EnableFeignClients', false),
(22, '@Microservice', false),
(23, 'Định tuyến (Routing), Xác thực (Authentication), và Rate Limiting', true),
(23, 'Kết nối Database', false),
(23, 'Render giao diện', false),
(23, 'Xử lý logic nghiệp vụ chính', false),
(24, 'Nơi lưu trữ các luồng thông điệp (messages) theo danh mục', true),
(24, 'Nơi đăng ký server', false),
(24, 'Giao diện quản lý', false),
(24, 'Một giao thức mạng', false);


-- ==========================================
-- 9. ENROLLMENTS & TRANSACTIONS
-- ==========================================
INSERT INTO elearning.enrollments (student_id, course_id, status) VALUES
(3, 1, 'ACTIVE'), 
(3, 2, 'ACTIVE'), 
(4, 1, 'ACTIVE'),
(5, 2, 'ACTIVE'),
(9, 2, 'ACTIVE'),
(10, 4, 'ACTIVE'),
(11, 1, 'ACTIVE');

-- ==========================================
-- 10. LESSON PROGRESS & QUIZ ATTEMPTS
-- ==========================================
-- Tự động sinh tiến độ hoàn thành (Cho user 3 học khoá 1 và 2)
INSERT INTO elearning.lesson_progress (student_id, lesson_id, is_completed) VALUES
(3, 1, true),
(3, 2, true),
(3, 3, true),
(3, 4, true),
(3, 5, true),
(3, 6, true),
(3, 7, true),
(3, 8, true),
(3, 9, true),
(3, 10, false),
(3, 17, true),
(3, 18, true),
(3, 19, true),
(3, 20, true),
(3, 21, true),
(3, 22, true),
(3, 24, false);


INSERT INTO elearning.quiz_attempts (student_id, quiz_id, score, is_passed) VALUES
(3, 1, 100.0, true),
(3, 2, 80.0, true);

-- ==========================================
-- 11. PAYMENTS
-- ==========================================
INSERT INTO elearning.payments (student_id, course_id, amount, payment_method, transaction_code, payment_status) VALUES
(3, 1, 1200000, 'MoMo', 'MOMO_8A3B2F89C1', 'SUCCESS'),
(3, 2, 800000, 'VNPay', 'VNPAY_ABCXYZ987', 'SUCCESS'),
(4, 1, 1200000, 'VNPay', 'VNPAY_7283B291A', 'SUCCESS'),
(5, 2, 800000, 'Bank Transfer', 'BANK_VCB_098123', 'SUCCESS'),
(9, 2, 800000, 'MoMo', 'MOMO_12C3D4E5F6', 'SUCCESS'),
(10, 4, 500000, 'VNPay', 'VNPAY_6B7C8D9E0', 'SUCCESS'),
(11, 1, 1200000, 'MoMo', 'MOMO_ZXC123456', 'PENDING');
