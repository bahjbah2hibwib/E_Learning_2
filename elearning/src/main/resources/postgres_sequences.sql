
-- Cập nhật sequence cho PostgreSQL để tránh lỗi duplicate key sau khi insert cứng ID
SELECT setval('elearning.users_user_id_seq', (SELECT MAX(user_id) FROM elearning.users));
SELECT setval('elearning.categories_category_id_seq', (SELECT MAX(category_id) FROM elearning.categories));
SELECT setval('elearning.courses_course_id_seq', (SELECT MAX(course_id) FROM elearning.courses));
SELECT setval('elearning.sections_section_id_seq', (SELECT MAX(section_id) FROM elearning.sections));
SELECT setval('elearning.lessons_lesson_id_seq', (SELECT MAX(lesson_id) FROM elearning.lessons));
SELECT setval('elearning.videos_video_id_seq', (SELECT MAX(video_id) FROM elearning.videos));
SELECT setval('elearning.reading_materials_material_id_seq', COALESCE((SELECT MAX(material_id) FROM elearning.reading_materials), 1));
SELECT setval('elearning.lesson_assets_asset_id_seq', COALESCE((SELECT MAX(asset_id) FROM elearning.lesson_assets), 1));
SELECT setval('elearning.quizzes_quiz_id_seq', (SELECT MAX(quiz_id) FROM elearning.quizzes));
SELECT setval('elearning.questions_question_id_seq', (SELECT MAX(question_id) FROM elearning.questions));
SELECT setval('elearning.answers_answer_id_seq', (SELECT MAX(answer_id) FROM elearning.answers));
SELECT setval('elearning.enrollments_enrollment_id_seq', COALESCE((SELECT MAX(enrollment_id) FROM elearning.enrollments), 1));
SELECT setval('elearning.lesson_progress_progress_id_seq', COALESCE((SELECT MAX(progress_id) FROM elearning.lesson_progress), 1));
SELECT setval('elearning.quiz_attempts_attempt_id_seq', COALESCE((SELECT MAX(attempt_id) FROM elearning.quiz_attempts), 1));
SELECT setval('elearning.payments_payment_id_seq', COALESCE((SELECT MAX(payment_id) FROM elearning.payments), 1));
SELECT setval('elearning.files_file_id_seq', (SELECT MAX(file_id) FROM elearning.files));
SELECT setval('elearning.system_activities_activity_id_seq', COALESCE((SELECT MAX(activity_id) FROM elearning.system_activities), 1));
SELECT setval('elearning.notifications_notification_id_seq', COALESCE((SELECT MAX(notification_id) FROM elearning.notifications), 1));
