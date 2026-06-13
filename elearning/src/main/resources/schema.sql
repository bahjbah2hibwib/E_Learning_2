SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS elearning.notifications;
DROP TABLE IF EXISTS elearning.system_activities;
DROP TABLE IF EXISTS elearning.payments;
DROP TABLE IF EXISTS elearning.quiz_attempts;
DROP TABLE IF EXISTS elearning.lesson_progress;
DROP TABLE IF EXISTS elearning.enrollments;
DROP TABLE IF EXISTS elearning.answers;
DROP TABLE IF EXISTS elearning.questions;
DROP TABLE IF EXISTS elearning.quizzes;
DROP TABLE IF EXISTS elearning.reading_materials;
DROP TABLE IF EXISTS elearning.videos;
DROP TABLE IF EXISTS elearning.lesson_assets;
DROP TABLE IF EXISTS elearning.lessons;
DROP TABLE IF EXISTS elearning.sections;
DROP TABLE IF EXISTS elearning.courses;
DROP TABLE IF EXISTS elearning.categories;
DROP TABLE IF EXISTS elearning.users;
DROP TABLE IF EXISTS elearning.files;


CREATE TABLE elearning.files (
    file_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL, 
    file_type VARCHAR(50),  
    file_size BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE elearning.users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_file_id BIGINT,
    phone VARCHAR(20) UNIQUE,
    date_of_birth DATE,
    role VARCHAR(20) NOT NULL,
    status BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_role CHECK (role IN ('ROLE_STUDENT', 'ROLE_INSTRUCTOR', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')),
    CONSTRAINT fk_users_avatar FOREIGN KEY (avatar_file_id) REFERENCES elearning.files(file_id)
);

CREATE TABLE elearning.categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE elearning.courses (
    course_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    what_you_will_learn TEXT,
    thumbnail_file_id BIGINT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    is_free BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    instructor_id BIGINT NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_course_status CHECK (status IN ('PENDING', 'APPROVED', 'HIDDEN')),
    CONSTRAINT fk_course_instructor FOREIGN KEY (instructor_id) REFERENCES elearning.users(user_id),
    CONSTRAINT fk_course_category FOREIGN KEY (category_id) REFERENCES elearning.categories(category_id),
    CONSTRAINT fk_course_thumbnail FOREIGN KEY (thumbnail_file_id) REFERENCES elearning.files(file_id)
);

CREATE TABLE elearning.sections (
    section_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    section_order INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_section_course FOREIGN KEY (course_id) REFERENCES elearning.courses(course_id) ON DELETE CASCADE,
    CONSTRAINT uq_course_section_order UNIQUE(course_id, section_order)
);

CREATE TABLE elearning.lessons (
    lesson_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    section_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    lesson_type VARCHAR(20) NOT NULL,
    description TEXT,
    lesson_order INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_lesson_section FOREIGN KEY (section_id) REFERENCES elearning.sections(section_id) ON DELETE CASCADE,
    CONSTRAINT uq_section_lesson_order UNIQUE(section_id, lesson_order),
    CONSTRAINT chk_lesson_type CHECK (lesson_type IN ('VIDEO', 'DOCUMENT', 'QUIZ'))
);

CREATE TABLE elearning.videos (
    video_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lesson_id BIGINT NOT NULL,
    video_type VARCHAR(20) NOT NULL,
    video_file_id BIGINT,
    duration INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_video_type CHECK (video_type IN ('UPLOAD', 'YOUTUBE')),
    CONSTRAINT fk_video_lesson FOREIGN KEY (lesson_id) REFERENCES elearning.lessons(lesson_id) ON DELETE CASCADE,
    CONSTRAINT fk_video_file FOREIGN KEY (video_file_id) REFERENCES elearning.files(file_id)
);

CREATE TABLE elearning.reading_materials (
    material_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lesson_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content_html TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_material_lesson FOREIGN KEY (lesson_id) REFERENCES elearning.lessons(lesson_id) ON DELETE CASCADE
);

CREATE TABLE elearning.lesson_assets (
    asset_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lesson_id BIGINT NOT NULL,
    file_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_asset_lesson FOREIGN KEY (lesson_id) REFERENCES elearning.lessons(lesson_id) ON DELETE CASCADE,
    CONSTRAINT fk_asset_file FOREIGN KEY (file_id) REFERENCES elearning.files(file_id)
);

CREATE TABLE elearning.quizzes (
    quiz_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lesson_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    passing_score INT DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_quiz_lesson FOREIGN KEY (lesson_id) REFERENCES elearning.lessons(lesson_id) ON DELETE CASCADE
);

CREATE TABLE elearning.questions (
    question_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quiz_id BIGINT NOT NULL,
    question_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_question_quiz FOREIGN KEY (quiz_id) REFERENCES elearning.quizzes(quiz_id) ON DELETE CASCADE
);

CREATE TABLE elearning.answers (
    answer_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_answer_question FOREIGN KEY (question_id) REFERENCES elearning.questions(question_id) ON DELETE CASCADE
);

CREATE TABLE elearning.enrollments (
    enrollment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    enroll_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    CONSTRAINT fk_enrollment_student FOREIGN KEY (student_id) REFERENCES elearning.users(user_id),
    CONSTRAINT fk_enrollment_course FOREIGN KEY (course_id) REFERENCES elearning.courses(course_id),
    CONSTRAINT uq_student_course UNIQUE(student_id, course_id)
);

CREATE TABLE elearning.lesson_progress (
    progress_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    lesson_id BIGINT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    CONSTRAINT fk_progress_student FOREIGN KEY (student_id) REFERENCES elearning.users(user_id),
    CONSTRAINT fk_progress_lesson FOREIGN KEY (lesson_id) REFERENCES elearning.lessons(lesson_id),
    CONSTRAINT uq_student_lesson UNIQUE(student_id, lesson_id)
);

CREATE TABLE elearning.quiz_attempts (
    attempt_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    quiz_id BIGINT NOT NULL,
    score NUMERIC(5,2),
    is_passed BOOLEAN,
    started_at TIMESTAMP,
    submitted_at TIMESTAMP,
    CONSTRAINT fk_attempt_student FOREIGN KEY (student_id) REFERENCES elearning.users(user_id),
    CONSTRAINT fk_attempt_quiz FOREIGN KEY (quiz_id) REFERENCES elearning.quizzes(quiz_id)
);

CREATE TABLE elearning.payments (
    payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    transaction_code VARCHAR(255) UNIQUE,
    payment_status VARCHAR(20) NOT NULL,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_payment_status CHECK (payment_status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED')),
    CONSTRAINT fk_payment_student FOREIGN KEY (student_id) REFERENCES elearning.users(user_id),
    CONSTRAINT fk_payment_course FOREIGN KEY (course_id) REFERENCES elearning.courses(course_id)
);

CREATE TABLE elearning.system_activities (
    activity_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_id BIGINT,
    action_type VARCHAR(50) NOT NULL, -- Hành động: REGISTER (Đăng ký mới), PURCHASE (Mua hàng), COMPLETE_LESSON (Học xong bài)...
    target_id BIGINT, -- Tham chiếu tới đối tượng: Mã khóa học, mã bài học, hoặc mã giao dịch
    target_type VARCHAR(50), -- Loại đối tượng: COURSE, LESSON, PAYMENT
    metadata JSON, -- Lưu thêm thông tin chi tiết (VD: Giá tiền mua, Tên thiết bị đăng nhập, v.v...)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_actor FOREIGN KEY (actor_id) REFERENCES elearning.users(user_id) ON DELETE SET NULL
);

CREATE TABLE elearning.notifications (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL, -- Ai là người sẽ nhận thông báo này (Thường là ID của Admin)
    activity_id BIGINT, -- Liên kết tới hành động gốc (Để biết chi tiết)
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- Phân loại: PAYMENT_ALERT, NEW_USER_ALERT, COURSE_COMPLETION...
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES elearning.users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_activity FOREIGN KEY (activity_id) REFERENCES elearning.system_activities(activity_id) ON DELETE SET NULL
);

CREATE INDEX idx_files_type ON elearning.files(file_type);
CREATE INDEX idx_users_email ON elearning.users(email);
CREATE INDEX idx_notification_user ON elearning.notifications(user_id, is_read);

SET FOREIGN_KEY_CHECKS = 1;