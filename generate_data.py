import re
import random

def generate_curriculum():
    sections = []
    lessons = []
    videos = []
    quizzes = []
    questions = []
    answers = []
    progress = []
    quiz_attempts = []

    s_id = 1
    l_id = 1
    v_id = 1
    q_id = 1
    qn_id = 1
    a_id = 1

    courses_data = [
        {
            "course_id": 1,
            "name": "Java Spring Boot & ReactJS Fullstack",
            "sections": [
                {"title": "Chương 1: Lộ trình & Tư duy", "lessons": ["Giới thiệu khóa học", "Cài đặt môi trường (JDK, NodeJS)", "Tư duy Fullstack"]},
                {"title": "Chương 2: Java Core Cơ Bản", "lessons": ["Biến và kiểu dữ liệu", "Câu lệnh điều kiện", "Vòng lặp", "Mảng và String"]},
                {"title": "Chương 3: Lập trình Hướng đối tượng OOP", "lessons": ["Class & Object", "Tính đóng gói", "Tính kế thừa", "Tính đa hình", "Interface & Abstract"]},
                {"title": "Chương 4: Cơ sở dữ liệu & JPA", "lessons": ["Thiết kế DB cho E-learning", "Spring Data JPA cơ bản", "JPA Relationships (1-N, N-N)"]},
                {"title": "Chương 5: Spring Boot & REST API", "lessons": ["Khởi tạo Spring Boot", "Controller & REST", "Service Layer", "Exception Handling"]},
                {"title": "Chương 6: Bảo mật với Spring Security", "lessons": ["JWT Filter", "Authentication Manager", "Phân quyền User/Admin"]},
                {"title": "Chương 7: ReactJS Frontend", "lessons": ["React Hooks (useState, useEffect)", "React Router", "Redux Toolkit", "Ant Design UI"]},
                {"title": "Chương 8: Hoàn thiện & Triển khai", "lessons": ["Ghép nối API", "Deploy lên AWS", "Tổng kết"]}
            ]
        },
        {
            "course_id": 2,
            "name": "Lập trình Frontend từ Zero đến Hero",
            "sections": [
                {"title": "Chương 1: HTML Cơ bản", "lessons": ["Cấu trúc trang Web", "Thẻ tiêu đề, đoạn văn", "Bảng và Form"]},
                {"title": "Chương 2: CSS Cơ bản", "lessons": ["Bộ chọn CSS", "Box Model", "Flexbox", "CSS Grid"]},
                {"title": "Chương 3: JavaScript Nền tảng", "lessons": ["Biến, hàm, điều kiện", "Xử lý mảng và đối tượng", "DOM Manipulation"]},
                {"title": "Chương 4: ReactJS & UI", "lessons": ["React Component", "State & Props", "React Lifecycle"]},
                {"title": "Chương 5: Đồ án thực tế", "lessons": ["Phân tích giao diện", "Code Header & Footer", "Code Trang chủ"]}
            ]
        },
        {
            "course_id": 3,
            "name": "Machine Learning với Python",
            "sections": [
                {"title": "Chương 1: Cài đặt & Python", "lessons": ["Cài đặt Anaconda", "Cơ bản về Python", "Jupyter Notebook"]},
                {"title": "Chương 2: Thư viện Toán học", "lessons": ["Numpy Array", "Pandas DataFrame", "Matplotlib vẽ biểu đồ"]},
                {"title": "Chương 3: Supervised Learning", "lessons": ["Linear Regression", "Logistic Regression", "Decision Tree"]},
                {"title": "Chương 4: Unsupervised Learning", "lessons": ["K-Means Clustering", "PCA"]},
                {"title": "Chương 5: Đồ án ML", "lessons": ["Dự đoán giá nhà", "Phân loại ảnh"]}
            ]
        }
    ]

    youtube_links = [
        "https://www.youtube.com/watch?v=9SGDpanrc8U",
        "https://www.youtube.com/watch?v=ztHopE5Wnpc",
        "https://www.youtube.com/watch?v=8SGI_WEzVug",
        "https://www.youtube.com/watch?v=her_7pa0vrg",
        "https://www.youtube.com/watch?v=w7ejDZ8SWv8",
        "https://www.youtube.com/watch?v=iVQqnoPtbu0",
        "https://www.youtube.com/watch?v=x0fSBAgBrOQ",
        "https://www.youtube.com/watch?v=O6P86uwfdR0",
        "https://www.youtube.com/watch?v=59IXY5IDrBA",
        "https://www.youtube.com/watch?v=RlnvEXzHw2Q",
        "https://www.youtube.com/watch?v=a199KZGMNxk",
        "https://www.youtube.com/watch?v=grEKMHGYyns"
    ]

    for course in courses_data:
        s_order = 1
        for sec in course['sections']:
            sections.append(f"({s_id}, {course['course_id']}, '{sec['title']}', {s_order})")
            
            l_order = 1
            for idx, les in enumerate(sec['lessons']):
                lesson_type = 'VIDEO'
                clean_les = les.replace("'", "''")
                
                lessons.append(f"({l_id}, {s_id}, '{clean_les}', '{lesson_type}', 'Mô tả bài học: {clean_les}', {l_order})")
                
                y_url = youtube_links[l_id % len(youtube_links)]
                duration = 15 + (l_id % 30)
                videos.append(f"({v_id}, {l_id}, 'YOUTUBE', '{y_url}', {duration})")
                v_id += 1
                
                quizzes.append(f"({q_id}, {l_id}, 'Bài tập thực hành: {clean_les}', 50)")
                
                for i in range(1, 21):
                    q_text = f"Câu hỏi {i} để kiểm tra kiến thức phần {clean_les}?"
                    questions.append(f"({qn_id}, {q_id}, '{q_text}')")
                    
                    correct_idx = random.randint(1, 4)
                    for j in range(1, 5):
                        is_correct = 'true' if j == correct_idx else 'false'
                        ans_text = f"Phù hợp với tính chất {j}" if j != correct_idx else f"Đáp án chính xác cho phần {clean_les}"
                        answers.append(f"({a_id}, {qn_id}, '{ans_text}', {is_correct})")
                        a_id += 1
                        
                    qn_id += 1
                
                if course['course_id'] == 1:
                    if l_id <= 15:
                        progress.append(f"(3, {l_id}, true)")
                        quiz_attempts.append(f"(3, {q_id}, 95.0, true)")
                    elif l_id <= 20:
                        progress.append(f"(3, {l_id}, false)")

                q_id += 1
                l_id += 1
                l_order += 1
                
            s_id += 1
            s_order += 1

    return sections, lessons, videos, quizzes, questions, answers, progress, quiz_attempts


sections, lessons, videos, quizzes, questions, answers, progress, quiz_attempts = generate_curriculum()

sql_parts = []

sql_parts.append("-- ==========================================\n-- 4.5 SECTIONS\n-- ==========================================")
sql_parts.append("INSERT INTO elearning.sections (section_id, course_id, title, section_order) VALUES\n" + ",\n".join(sections) + ";\n")

sql_parts.append("-- ==========================================\n-- 5. LESSONS\n-- ==========================================")
sql_parts.append("INSERT INTO elearning.lessons (lesson_id, section_id, title, lesson_type, description, lesson_order) VALUES\n" + ",\n".join(lessons) + ";\n")

sql_parts.append("-- ==========================================\n-- 6. VIDEOS\n-- ==========================================")
sql_parts.append("INSERT INTO elearning.videos (video_id, lesson_id, video_type, youtube_url, duration) VALUES\n" + ",\n".join(videos) + ";\n")

sql_parts.append("-- ==========================================\n-- 7. QUIZZES, QUESTIONS, ANSWERS\n-- ==========================================")
sql_parts.append("INSERT INTO elearning.quizzes (quiz_id, lesson_id, title, passing_score) VALUES\n" + ",\n".join(quizzes) + ";\n")
sql_parts.append("INSERT INTO elearning.questions (question_id, quiz_id, question_text) VALUES\n" + ",\n".join(questions) + ";\n")
sql_parts.append("INSERT INTO elearning.answers (answer_id, question_id, answer_text, is_correct) VALUES\n" + ",\n".join(answers) + ";\n")

sql_parts.append("-- ==========================================\n-- 10. LESSON PROGRESS & QUIZ ATTEMPTS\n-- ==========================================")
sql_parts.append("INSERT INTO elearning.lesson_progress (student_id, lesson_id, is_completed) VALUES\n" + ",\n".join(progress) + ";\n")
sql_parts.append("INSERT INTO elearning.quiz_attempts (student_id, quiz_id, score, is_passed) VALUES\n" + ",\n".join(quiz_attempts) + ";\n")

new_sql = "\n".join(sql_parts)

with open('d:/Data_program/project/E_learning2/elearning/src/main/resources/data.sql', 'r', encoding='utf-8') as f:
    content = f.read()

pattern1 = re.compile(r'-- ==========================================\n-- 4\.5 SECTIONS\n-- ==========================================.*?(-- ==========================================\n-- 9\. ENROLLMENTS & TRANSACTIONS)', re.DOTALL)
content = pattern1.sub(new_sql.split("-- ==========================================\n-- 10. LESSON PROGRESS & QUIZ ATTEMPTS")[0] + r'\n\1', content)

pattern2 = re.compile(r'-- ==========================================\n-- 10\. LESSON PROGRESS & QUIZ ATTEMPTS\n-- ==========================================.*?(-- ==========================================\n-- 11\. PAYMENTS)', re.DOTALL)
content = pattern2.sub("-- ==========================================\n-- 10. LESSON PROGRESS & QUIZ ATTEMPTS\n-- ==========================================\n" + new_sql.split("-- ==========================================\n-- 10. LESSON PROGRESS & QUIZ ATTEMPTS\n-- ==========================================\n")[1] + r'\n\1', content)

with open('d:/Data_program/project/E_learning2/elearning/src/main/resources/data.sql', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Fixed quotes! Massive curriculum generated with {len(questions)} questions and {len(answers)} answers!")
