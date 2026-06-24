import React, { useState } from "react";
import {
  Typography,
  Button,
  Card,
  Row,
  Col,
  Collapse,
  Space,
  Tooltip,
  Modal,
  Form,
  Input,
  Select,
  message,
  Spin,
  Upload,
  Tabs,
  List,
  Radio,
  InputNumber,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HolderOutlined,
  PlayCircleFilled,
  FileTextFilled,
  QuestionCircleFilled,
  SettingOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
  CloseCircleOutlined,
  YoutubeOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import instructorService from "../../../services/instructorService";

const { Text, Title } = Typography;
const { Panel } = Collapse;
const { confirm } = Modal;

const getLessonIcon = (type) => {
  switch (type) {
    case "VIDEO":
      return {
        icon: (
          <PlayCircleFilled style={{ color: "#3b82f6", fontSize: "18px" }} />
        ),
        bg: "#eff6ff",
      };
    case "DOCUMENT":
      return {
        icon: <FileTextFilled style={{ color: "#f97316", fontSize: "18px" }} />,
        bg: "#fff7ed",
      };
    case "QUIZ":
      return {
        icon: (
          <QuestionCircleFilled
            style={{ color: "#8b5cf6", fontSize: "18px" }}
          />
        ),
        bg: "#f5f3ff",
      };
    default:
      return {
        icon: <FileTextFilled style={{ color: "#64748b", fontSize: "18px" }} />,
        bg: "#f1f5f9",
      };
  }
};

const CurriculumTab = ({ courseData, courseId, onRefresh }) => {
  const [isSectionModalVisible, setIsSectionModalVisible] = useState(false);
  const [isLessonModalVisible, setIsLessonModalVisible] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [selectedLessonForSettings, setSelectedLessonForSettings] =
    useState(null);
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // ✅ Thêm: state cho edit tên chương
  const [isEditSectionModalVisible, setIsEditSectionModalVisible] =
    useState(false);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editSectionForm] = Form.useForm();

  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState("");
  const [youtubeUrlInput, setYoutubeUrlInput] = useState("");

  const [sectionForm] = Form.useForm();
  const [lessonForm] = Form.useForm();
  const [lessonUpdateForm] = Form.useForm();

  const curriculum = courseData?.sections || [];

  const totalSections = curriculum.length;
  const totalLessons = curriculum.reduce(
    (acc, sec) => acc + (sec.lessons?.length || 0),
    0,
  );
  const totalQuizzes = curriculum.reduce(
    (acc, sec) =>
      acc +
      (sec.lessons?.reduce(
        (lessonAcc, lesson) => lessonAcc + (lesson.quizzes?.length || 0),
        0,
      ) || 0),
    0,
  );
  const totalDurationMinutes = curriculum.reduce(
    (acc, sec) =>
      acc +
      (sec.lessons?.reduce(
        (lessonAcc, lesson) => lessonAcc + (lesson.durationMinutes || 0),
        0,
      ) || 0),
    0,
  );
  const totalDurationHours = Math.floor(totalDurationMinutes / 60);
  const remainingMinutes = totalDurationMinutes % 60;
  const durationText =
    totalDurationHours > 0
      ? `${totalDurationHours}h ${remainingMinutes > 0 ? remainingMinutes + "m" : ""}`
      : `${totalDurationMinutes}m`;

  const handleCreateSection = async (values) => {
    try {
      if (!courseId) {
        message.error("Không tìm thấy ID khóa học");
        return;
      }
      setLoading(true);
      await instructorService.createSection(courseId, { title: values.title });
      message.success("Thêm chương mới thành công!");
      setIsSectionModalVisible(false);
      sectionForm.resetFields();
      if (onRefresh) onRefresh();
    } catch (error) {
      message.error(error.message || "Lỗi khi tạo chương học");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Thêm: xử lý cập nhật tên chương
  const handleUpdateSection = async (values) => {
    try {
      setLoading(true);
      await instructorService.updateSection(editingSectionId, {
        title: values.title,
      });
      message.success("Cập nhật tên chương thành công!");
      setIsEditSectionModalVisible(false);
      editSectionForm.resetFields();
      if (onRefresh) onRefresh();
    } catch (error) {
      message.error(error.message || "Lỗi khi cập nhật chương học");
    } finally {
      setLoading(false);
    }
  };

  const openEditSectionModal = (section, e) => {
    e.stopPropagation();
    setEditingSectionId(section.sectionId);
    editSectionForm.setFieldsValue({ title: section.title });
    setIsEditSectionModalVisible(true);
  };

  const handleCreateLesson = async (values) => {
    try {
      setLoading(true);
      await instructorService.createLesson(activeSectionId, {
        title: values.title,
        lessonType: values.lessonType || "VIDEO",
      });
      message.success("Thêm bài giảng mới thành công!");
      setIsLessonModalVisible(false);
      lessonForm.resetFields();
      if (onRefresh) onRefresh();
    } catch (error) {
      message.error(error.message || "Lỗi khi tạo bài giảng");
    } finally {
      setLoading(false);
    }
  };

  const openLessonModal = (sectionId) => {
    setActiveSectionId(sectionId);
    setIsLessonModalVisible(true);
  };

  const openSettingsModal = (lesson) => {
    setSelectedLessonForSettings(lesson);
    lessonUpdateForm.setFieldsValue({
      title: lesson.title,
      description: lesson.description || "",
    });
    setIsSettingsModalVisible(true);
  };

  const handleUpdateLesson = async (values) => {
    try {
      setLoading(true);
      const res = await instructorService.updateLesson(
        selectedLessonForSettings.lessonId,
        values,
      );
      if (res && res.success) {
        message.success("Cập nhật nội dung bài giảng thành công!");
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      message.error(error.message || "Lỗi khi cập nhật bài giảng");
    } finally {
      setLoading(false);
    }
  };

  const getVideoDuration = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = function () {
        window.URL.revokeObjectURL(video.src);
        resolve(Math.max(1, Math.round(video.duration / 60)));
      };
      video.onerror = function () {
        resolve(1);
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const handleUploadVideo = async ({
    file,
    onSuccess,
    onError,
    onProgress,
  }) => {
    try {
      onProgress({ percent: 50 });
      const durationMinutes = await getVideoDuration(file);
      const uploadRes = await instructorService.uploadFile(file);
      if (uploadRes && uploadRes.success) {
        onProgress({ percent: 90 });
        const fileId = uploadRes.data.fileId;
        const attachRes = await instructorService.addLessonVideo(
          selectedLessonForSettings.lessonId,
          { fileId, durationMinutes },
        );
        if (attachRes && attachRes.success) {
          onProgress({ percent: 100 });
          onSuccess(attachRes.data);
          message.success("Tải lên video thành công!");
          setSelectedLessonForSettings((prev) => ({
            ...prev,
            videos: [...(prev.videos || []), attachRes.data],
          }));
          if (onRefresh) onRefresh();
        } else {
          throw new Error("Failed to attach video");
        }
      } else {
        throw new Error("Failed to upload file");
      }
    } catch (error) {
      onError(error);
      message.error("Lỗi tải video lên: " + error.message);
    }
  };

  const extractYoutubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const fetchYoutubeDurationWithIframe = (videoId) => {
    return new Promise((resolve) => {
      const divId = 'yt-player-' + Date.now();
      const div = document.createElement('div');
      div.id = divId;
      div.style.position = 'absolute';
      div.style.left = '-9999px';
      div.style.width = '10px';
      div.style.height = '10px';
      document.body.appendChild(div);

      const checkYTAndInit = () => {
        if (window.YT && window.YT.Player) {
          const player = new window.YT.Player(divId, {
            videoId: videoId,
            events: {
              'onReady': (event) => {
                event.target.mute();
                event.target.playVideo();
                
                const checkDur = setInterval(() => {
                  const dur = event.target.getDuration();
                  if (dur > 0) {
                    clearInterval(checkDur);
                    player.destroy();
                    if (document.getElementById(divId)) {
                      document.body.removeChild(div);
                    }
                    resolve(Math.ceil(dur / 60));
                  }
                }, 200);
              },
              'onStateChange': (event) => {
                 // Đảm bảo video không tự chạy ngầm mãi
                 if (event.data === 1 && window.YT) {
                    const dur = event.target.getDuration();
                    if (dur > 0) {
                      player.pauseVideo();
                    }
                 }
              },
              'onError': () => {
                player.destroy();
                if (document.getElementById(divId)) {
                  document.body.removeChild(div);
                }
                resolve(0);
              }
            }
          });
        } else {
          setTimeout(checkYTAndInit, 100);
        }
      };

      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
      checkYTAndInit();
      
      // Fallback nếu mạng chậm hoặc lỗi không phản hồi sau 5s
      setTimeout(() => {
        if (document.getElementById(divId)) {
          document.body.removeChild(div);
          resolve(0);
        }
      }, 5000);
    });
  };

  const handleAddYoutubeVideo = async () => {
    if (!youtubeUrlInput) {
      message.error("Vui lòng nhập link YouTube");
      return;
    }
    try {
      setLoading(true);
      
      const videoId = extractYoutubeVideoId(youtubeUrlInput);
      let calculatedDuration = 0;
      
      if (videoId) {
        // Tự động phân tích thời lượng bằng thẻ iframe ẩn
        message.loading({ content: 'Đang phân tích thời lượng video...', key: 'analyzing' });
        calculatedDuration = await fetchYoutubeDurationWithIframe(videoId);
        message.destroy('analyzing');
      }
      
      const res = await instructorService.addLessonVideo(
        selectedLessonForSettings.lessonId,
        { 
          youtubeUrl: youtubeUrlInput, 
          videoType: "YOUTUBE", 
          durationMinutes: calculatedDuration > 0 ? calculatedDuration : 10 // fallback
        }
      );
      if (res && res.success) {
        message.success(`Thêm video YouTube thành công! (Tự động tính: ${calculatedDuration > 0 ? calculatedDuration : 10} phút)`);
        setYoutubeUrlInput("");
        setSelectedLessonForSettings((prev) => ({
          ...prev,
          videos: [...(prev.videos || []), res.data],
        }));
        if (onRefresh) onRefresh();
      } else {
        throw new Error(res.message || "Lỗi khi thêm video");
      }
    } catch (error) {
      message.error(error.message || "Lỗi khi thêm video YouTube");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = async ({
    file,
    onSuccess,
    onError,
    onProgress,
  }) => {
    try {
      onProgress({ percent: 50 });
      const uploadRes = await instructorService.uploadFile(file);
      if (uploadRes && uploadRes.success) {
        onProgress({ percent: 90 });
        const fileId = uploadRes.data.fileId;
        const attachRes = await instructorService.addLessonDocument(
          selectedLessonForSettings.lessonId,
          { fileId },
        );
        if (attachRes && attachRes.success) {
          onProgress({ percent: 100 });
          onSuccess(attachRes.data);
          message.success("Tải lên tài liệu đính kèm thành công!");
          setSelectedLessonForSettings((prev) => ({
            ...prev,
            documents: [...(prev.documents || []), attachRes.data],
          }));
          if (onRefresh) onRefresh();
        } else {
          throw new Error("Failed to attach document");
        }
      } else {
        throw new Error("Failed to upload file");
      }
    } catch (error) {
      onError(error);
      message.error("Lỗi khi tải lên tài liệu");
    }
  };

  const openQuestionModal = () => {
    questionForm.resetFields();
    questionForm.setFieldsValue({ correctAnswer: 0 });
    setEditingQuestionId(null);
    setIsQuestionModalVisible(true);
  };

  const openEditQuestionModal = (question) => {
    questionForm.setFieldsValue({
      questionText: question.questionText,
      answer0: question.answers[0]?.answerText || "",
      answer1: question.answers[1]?.answerText || "",
      answer2: question.answers[2]?.answerText || "",
      answer3: question.answers[3]?.answerText || "",
      correctAnswer: question.answers.findIndex(a => a.isCorrect) !== -1 ? question.answers.findIndex(a => a.isCorrect) : 0
    });
    setEditingQuestionId(question.questionId);
    setIsQuestionModalVisible(true);
  };

  const handleDeleteQuiz = (questionId) => {
    confirm({
      title: "Xóa câu hỏi",
      content: "Bạn có chắc muốn xóa câu hỏi này?",
      onOk: async () => {
        try {
          await instructorService.deleteQuestion(questionId);
          message.success("Đã xóa câu hỏi thành công!");
          setSelectedLessonForSettings((prev) => {
             const newQuizzes = prev.quizzes.map(q => ({
                ...q,
                questions: q.questions.filter(quest => quest.questionId !== questionId)
             })).filter(q => q.questions.length > 0);
             return { ...prev, quizzes: newQuizzes };
          });
          if (onRefresh) onRefresh();
        } catch (err) {
          message.error("Lỗi khi xóa câu hỏi");
        }
      }
    });
  };

  const handleDeleteVideo = (videoId) => {
    confirm({
      title: "Xóa video",
      content: "Bạn có chắc muốn xóa video này khỏi bài giảng?",
      onOk: async () => {
        try {
          await instructorService.deleteVideo(videoId);
          message.success("Đã xóa video thành công!");
          setSelectedLessonForSettings((prev) => ({
             ...prev,
             videos: prev.videos.filter(v => v.videoId !== videoId)
          }));
          if (onRefresh) onRefresh();
        } catch (err) {
          message.error("Lỗi khi xóa video");
        }
      }
    });
  };

  const handleDeleteDocument = (assetId) => {
    confirm({
      title: "Xóa tài liệu",
      content: "Bạn có chắc muốn xóa tài liệu đính kèm này?",
      onOk: async () => {
        try {
          await instructorService.deleteDocument(assetId);
          message.success("Đã xóa tài liệu thành công!");
          setSelectedLessonForSettings((prev) => ({
             ...prev,
             documents: prev.documents.filter(d => d.documentId !== assetId)
          }));
          if (onRefresh) onRefresh();
        } catch (err) {
          message.error("Lỗi khi xóa tài liệu");
        }
      }
    });
  };

  const handleCreateQuestion = async () => {
    try {
      const values = await questionForm.validateFields();
      const payload = {
        questionText: values.questionText,
        questionType: "MULTIPLE_CHOICE",
        points: 10,
        answers: [
          { answerText: values.answer0, isCorrect: values.correctAnswer === 0 },
          { answerText: values.answer1, isCorrect: values.correctAnswer === 1 },
          { answerText: values.answer2, isCorrect: values.correctAnswer === 2 },
          { answerText: values.answer3, isCorrect: values.correctAnswer === 3 },
        ],
      };
      setLoading(true);

      if (editingQuestionId) {
        const res = await instructorService.updateQuestion(editingQuestionId, payload);
        if (res && res.success) {
          message.success("Cập nhật câu hỏi thành công!");
          setIsQuestionModalVisible(false);
          questionForm.resetFields();
          setEditingQuestionId(null);
          setSelectedLessonForSettings((prev) => {
            const newQuizzes = prev.quizzes.map(q => {
               const qIndex = q.questions.findIndex(quest => quest.questionId === editingQuestionId);
               if (qIndex > -1) {
                  const newQuestions = [...q.questions];
                  newQuestions[qIndex] = res.data;
                  return { ...q, questions: newQuestions };
               }
               return q;
            });
            return { ...prev, quizzes: newQuizzes };
          });
          if (onRefresh) onRefresh();
        }
      } else {
        const res = await instructorService.addLessonQuestion(
          selectedLessonForSettings.lessonId,
          payload,
        );
        if (res && res.success) {
          message.success("Thêm câu hỏi thành công!");
          setIsQuestionModalVisible(false);
          questionForm.resetFields();
          setSelectedLessonForSettings((prev) => {
            const quizzes = [...(prev.quizzes || [])];
            if (quizzes.length === 0) {
              quizzes.push({
                quizId: Date.now(),
                title: "Bài tập trắc nghiệm",
                questions: [res.data],
              });
            } else {
              quizzes[0].questions = [...(quizzes[0].questions || []), res.data];
            }
            return { ...prev, quizzes };
          });
          if (onRefresh) onRefresh();
        }
      }
    } catch (error) {
      if (!error.errorFields) {
        message.error(error.message || "Lỗi khi lưu câu hỏi");
      }
    } finally {
      setLoading(false);
    }
  };

  const showDeleteSectionConfirm = (sectionId, e) => {
    e.stopPropagation();
    confirm({
      title: "Bạn có chắc chắn muốn xóa chương này?",
      icon: <ExclamationCircleOutlined />,
      content: "Tất cả bài giảng trong chương sẽ bị xóa theo.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await instructorService.deleteSection(sectionId);
          message.success("Đã xóa chương thành công");
          if (onRefresh) onRefresh();
        } catch (error) {
          message.error("Lỗi khi xóa chương");
        }
      },
    });
  };

  const showDeleteLessonConfirm = (lessonId) => {
    confirm({
      title: "Bạn có chắc chắn muốn xóa bài giảng này?",
      icon: <ExclamationCircleOutlined />,
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await instructorService.deleteLesson(lessonId);
          message.success("Đã xóa bài giảng thành công");
          if (onRefresh) onRefresh();
        } catch (error) {
          message.error("Lỗi khi xóa bài giảng");
        }
      },
    });
  };

  const renderLessonItem = (lesson) => {
    const { icon, bg } = getLessonIcon(lesson.lessonType);
    return (
      <div
        key={lesson.lessonId}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 16px",
          backgroundColor: "#fff",
          border: "1px solid #f0f0f0",
          borderRadius: "8px",
          marginBottom: "8px",
          transition: "all 0.2s",
        }}
      >
        <HolderOutlined
          style={{
            color: "#cbd5e1",
            fontSize: "16px",
            cursor: "grab",
            marginRight: "16px",
          }}
        />
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            backgroundColor: bg,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginRight: "16px",
            cursor:
              lesson.lessonType === "VIDEO" && lesson.videos?.length > 0
                ? "pointer"
                : "default",
          }}
          onClick={() => {
            if (
              lesson.lessonType === "VIDEO" &&
              lesson.videos?.length > 0 &&
              lesson.videos[0].videoUrl
            ) {
              const url = lesson.videos[0].videoUrl;
              const fullUrl = url.startsWith("http")
                ? url
                : `http://localhost:9000/elearning/${url}`;
              setPreviewVideoUrl(fullUrl);
              setIsPreviewModalVisible(true);
            } else if (lesson.lessonType === "VIDEO") {
              message.info("Chưa có video nào được tải lên cho bài giảng này.");
            }
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <Text
            strong
            style={{
              fontSize: "14px",
              color: "#1e293b",
              display: "block",
              marginBottom: "2px",
            }}
          >
            {lesson.title}
          </Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {lesson.lessonType}{" "}
            {lesson.durationMinutes ? `• ${lesson.durationMinutes} Phút` : ""}
          </Text>
        </div>
        <Space size="middle">
          <Tooltip title="Cài đặt bài giảng">
            <Button
              type="text"
              icon={<SettingOutlined style={{ color: "#64748b" }} />}
              size="small"
              onClick={() => openSettingsModal(lesson)}
            />
          </Tooltip>
          <Tooltip title="Xóa bài giảng">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => showDeleteLessonConfirm(lesson.lessonId)}
            />
          </Tooltip>
        </Space>
      </div>
    );
  };

  const renderSectionHeader = (section) => (
    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
      <HolderOutlined
        style={{
          color: "#94a3b8",
          fontSize: "16px",
          cursor: "grab",
          marginRight: "12px",
        }}
      />
      <Text strong style={{ fontSize: "16px", color: "#0f172a", flex: 1 }}>
        {section.title}
      </Text>
      <Space size="small" onClick={(e) => e.stopPropagation()}>
        {/* ✅ Sửa: thêm onClick cho nút sửa tên chương */}
        <Tooltip title="Sửa tên chương">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "#3b82f6" }} />}
            size="small"
            onClick={(e) => openEditSectionModal(section, e)}
          />
        </Tooltip>
        <Tooltip title="Xóa chương">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={(e) => showDeleteSectionConfirm(section.sectionId, e)}
          />
        </Tooltip>
      </Space>
    </div>
  );

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        {curriculum.length > 0 ? (
          <Collapse
            defaultActiveKey={curriculum.map((s) => s.sectionId)}
            ghost
            expandIconPosition="start"
            style={{ padding: 0 }}
          >
            {curriculum.map((section) => (
              <Panel
                header={renderSectionHeader(section)}
                key={section.sectionId}
                style={{
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "0 8px" }}>
                  {section.lessons &&
                    section.lessons.map((lesson) => renderLessonItem(lesson))}
                  <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    onClick={() => openLessonModal(section.sectionId)}
                    style={{
                      height: "40px",
                      borderRadius: "8px",
                      color: "#64748b",
                      borderColor: "#cbd5e1",
                      backgroundColor: "transparent",
                      marginTop: section.lessons?.length > 0 ? "8px" : "0",
                    }}
                  >
                    Thêm bài giảng mới
                  </Button>
                </div>
              </Panel>
            ))}
          </Collapse>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              border: "1px dashed #cbd5e1",
            }}
          >
            <Text type="secondary">
              Chưa có chương học nào. Hãy bắt đầu bằng cách thêm chương mới.
            </Text>
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          marginBottom: "32px",
        }}
      >
        <Button icon={<EyeOutlined />} style={{ borderRadius: "6px" }}>
          Xem trước
        </Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ borderRadius: "6px", backgroundColor: "#0052cc" }}
          onClick={() => setIsSectionModalVisible(true)}
        >
          Thêm chương mới
        </Button>
      </div>

      <Card
        style={{
          borderRadius: "12px",
          backgroundColor: "#f8fafc",
          border: "1px solid #e2e8f0",
        }}
        bodyStyle={{ padding: "24px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <Title level={5} style={{ margin: 0, color: "#1e293b" }}>
            Tóm tắt chương trình
          </Title>
          <InfoCircleOutlined style={{ color: "#94a3b8", fontSize: "18px" }} />
        </div>
        <Row gutter={16}>
          {[
            { value: totalSections, label: "Chương học" },
            { value: totalLessons, label: "Bài giảng" },
            { value: durationText, label: "Tổng thời lượng" },
            { value: totalQuizzes, label: "Bài trắc nghiệm" },
          ].map((item, idx) => (
            <Col span={6} key={idx}>
              <div
                style={{
                  backgroundColor: "#fff",
                  padding: "16px",
                  borderRadius: "8px",
                  textAlign: "center",
                  border: "1px solid #f1f5f9",
                }}
              >
                <Title level={3} style={{ margin: 0, color: "#0052cc" }}>
                  {item.value}
                </Title>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {item.label}
                </Text>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Modal Thêm Chương */}
      <Modal
        title="Thêm chương mới"
        open={isSectionModalVisible}
        onCancel={() => setIsSectionModalVisible(false)}
        onOk={() => sectionForm.submit()}
        confirmLoading={loading}
        okText="Thêm mới"
        cancelText="Hủy"
      >
        <Form
          form={sectionForm}
          layout="vertical"
          onFinish={handleCreateSection}
        >
          <Form.Item
            name="title"
            label="Tiêu đề chương"
            rules={[
              { required: true, message: "Vui lòng nhập tiêu đề chương!" },
            ]}
          >
            <Input placeholder="Nhập tiêu đề chương..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* ✅ Thêm: Modal Sửa Tên Chương */}
      <Modal
        title="Sửa tên chương"
        open={isEditSectionModalVisible}
        onCancel={() => setIsEditSectionModalVisible(false)}
        onOk={() => editSectionForm.submit()}
        confirmLoading={loading}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form
          form={editSectionForm}
          layout="vertical"
          onFinish={handleUpdateSection}
        >
          <Form.Item
            name="title"
            label="Tiêu đề chương"
            rules={[
              { required: true, message: "Vui lòng nhập tiêu đề chương!" },
            ]}
          >
            <Input placeholder="Nhập tiêu đề chương..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Thêm Bài Giảng */}
      <Modal
        title="Thêm bài giảng mới"
        open={isLessonModalVisible}
        onCancel={() => setIsLessonModalVisible(false)}
        onOk={() => lessonForm.submit()}
        confirmLoading={loading}
        okText="Thêm mới"
        cancelText="Hủy"
      >
        <Form
          form={lessonForm}
          layout="vertical"
          onFinish={handleCreateLesson}
          initialValues={{ lessonType: "VIDEO" }}
        >
          <Form.Item
            name="title"
            label="Tiêu đề bài giảng"
            rules={[
              { required: true, message: "Vui lòng nhập tiêu đề bài giảng!" },
            ]}
          >
            <Input placeholder="Nhập tiêu đề bài giảng..." />
          </Form.Item>
          <Form.Item
            name="lessonType"
            label="Loại bài giảng"
            rules={[
              { required: true, message: "Vui lòng chọn loại bài giảng!" },
            ]}
          >
            <Select>
              <Select.Option value="VIDEO">Video</Select.Option>
              <Select.Option value="DOCUMENT">Tài liệu đọc</Select.Option>
              <Select.Option value="QUIZ">Bài tập trắc nghiệm</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Cài Đặt Bài Giảng */}
      <Modal
        title={
          <div style={{ fontSize: "18px", fontWeight: "bold", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
            Cài đặt bài giảng: <span style={{ color: "#3b82f6" }}>{selectedLessonForSettings?.title || ""}</span>
          </div>
        }
        open={isSettingsModalVisible}
        onCancel={() => setIsSettingsModalVisible(false)}
        footer={null}
        width={1300}
        style={{ top: 20 }}
        bodyStyle={{ padding: "24px", backgroundColor: "#f8fafc", maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}
      >
        <Row gutter={[24, 24]} align="stretch">
          {/* Cột trái: Thông tin & Trắc nghiệm */}
          <Col xs={24} lg={12} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Thông tin chung */}
            <Card
              title={<><InfoCircleOutlined style={{ color: "#64748b", marginRight: "8px" }} /> Thông tin chung</>}
              bordered={false}
              style={{ borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", height: "100%" }}
              headStyle={{ borderBottom: "1px solid #f1f5f9", fontWeight: 600, fontSize: "16px" }}
            >
              <Text type="secondary" style={{ display: "block", marginBottom: "20px" }}>
                Cập nhật tiêu đề và nội dung chi tiết của bài giảng.
              </Text>
              <Form
                form={lessonUpdateForm}
                layout="vertical"
                onFinish={handleUpdateLesson}
              >
                <Form.Item
                  name="title"
                  label={<Text strong>Tiêu đề bài giảng</Text>}
                  rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
                >
                  <Input size="large" placeholder="Nhập tiêu đề..." style={{ borderRadius: "8px" }} />
                </Form.Item>
                <Form.Item name="description" label={<Text strong>Nội dung chi tiết</Text>}>
                  <Input.TextArea
                    rows={6}
                    placeholder="Nhập nội dung chi tiết bài học..."
                    style={{ borderRadius: "8px" }}
                  />
                </Form.Item>
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button type="primary" htmlType="submit" loading={loading} size="large" style={{ borderRadius: "8px", fontWeight: 500 }}>
                    Lưu thông tin
                  </Button>
                </Form.Item>
              </Form>
            </Card>

            {/* Trắc nghiệm */}
            <Card
              title={<><QuestionCircleFilled style={{ color: "#0ea5e9", marginRight: "8px" }} /> Trắc nghiệm (Quiz)</>}
              bordered={false}
              style={{ borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", height: "100%" }}
              headStyle={{ borderBottom: "1px solid #f1f5f9", fontWeight: 600, fontSize: "16px" }}
              extra={
                <Button type="primary" ghost icon={<PlusOutlined />} onClick={openQuestionModal} style={{ borderRadius: "8px", fontWeight: 500 }}>
                  Thêm câu hỏi
                </Button>
              }
            >
              <Text type="secondary" style={{ display: "block", marginBottom: "20px" }}>
                Tạo các câu hỏi trắc nghiệm để kiểm tra mức độ hiểu bài của học viên.
              </Text>
              {selectedLessonForSettings?.quizzes?.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={selectedLessonForSettings.quizzes}
                  renderItem={(item) => (
                      <List.Item
                        style={{ backgroundColor: "#f8fafc", padding: "12px 16px", borderRadius: "8px", marginBottom: "8px", border: "1px solid #e2e8f0" }}
                        actions={[
                          <Button type="text" size="small" icon={<EditOutlined style={{ color: "#3b82f6" }} />} onClick={() => openEditQuestionModal(item.questions?.[0])} key="edit" />,
                          <Button danger type="text" size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteQuiz(item.questions?.[0]?.questionId)} key="delete" />,
                        ]}
                      >
                      <List.Item.Meta
                        avatar={
                          <div style={{ width: "40px", height: "40px", backgroundColor: "#e0f2fe", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#0ea5e9", fontWeight: "bold", fontSize: "16px" }}>Q</div>
                        }
                        title={<Text strong>{item.title}</Text>}
                        description={<Text type="secondary" style={{ fontSize: "13px" }}>{item.questions?.length || 0} câu hỏi</Text>}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ padding: "32px 16px", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
                  <QuestionCircleFilled style={{ fontSize: "32px", color: "#94a3b8", marginBottom: "12px" }} />
                  <p style={{ margin: 0, color: "#64748b" }}>Chưa có bài tập trắc nghiệm nào.</p>
                  <Button type="dashed" style={{ marginTop: "16px", borderRadius: "8px" }} onClick={openQuestionModal}>Tạo câu hỏi đầu tiên</Button>
                </div>
              )}
            </Card>
          </Col>

          {/* Cột phải: Video & Tài liệu */}
          <Col xs={24} lg={12} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Video */}
            <Card
              title={<><PlayCircleFilled style={{ color: "#ef4444", marginRight: "8px" }} /> Video Bài giảng</>}
              bordered={false}
              style={{ borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", height: "100%" }}
              headStyle={{ borderBottom: "1px solid #f1f5f9", fontWeight: 600, fontSize: "16px" }}
            >
              <Text type="secondary" style={{ display: "block", marginBottom: "16px" }}>
                Thêm video bài giảng từ YouTube (Khuyên dùng để tối ưu băng thông).
              </Text>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", backgroundColor: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div>
                  <Text strong style={{ display: "block", marginBottom: "8px" }}>Link YouTube</Text>
                  <Input 
                    placeholder="VD: https://www.youtube.com/watch?v=..." 
                    value={youtubeUrlInput}
                    onChange={(e) => setYoutubeUrlInput(e.target.value)}
                    prefix={<YoutubeOutlined style={{ color: "#ef4444" }} />}
                  />
                </div>
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
                    <Button type="primary" onClick={handleAddYoutubeVideo} loading={loading} icon={<PlusOutlined />} style={{ width: '100%' }}>
                      Tự động phân tích & Thêm Video
                    </Button>
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: "24px" }}>
                <Text strong style={{ display: "block", marginBottom: "12px" }}>Video đã thêm:</Text>
                {selectedLessonForSettings?.videos?.length > 0 ? (
                  <List
                    itemLayout="horizontal"
                    dataSource={selectedLessonForSettings.videos}
                    renderItem={(item) => (
                      <List.Item
                        style={{ backgroundColor: "#fff", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                        actions={[<Button danger type="text" size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteVideo(item.videoId)} key="delete" />]}
                      >
                        <List.Item.Meta
                          avatar={<div style={{ width: "40px", height: "40px", backgroundColor: "#fee2e2", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}><PlayCircleFilled style={{ color: "#ef4444", fontSize: "20px" }} /></div>}
                          title={<a href={item.videoUrl} target="_blank" rel="noreferrer" style={{ fontSize: "14px", fontWeight: 500 }}>{item.title}</a>}
                          description={<span style={{ fontSize: "12px", color: "#10b981", fontWeight: 500 }}>✓ Đã liên kết ({item.durationMinutes} phút)</span>}
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div style={{ padding: "16px", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px dashed #e2e8f0" }}>
                    <Text type="secondary" style={{ fontSize: "13px" }}>Chưa có video nào.</Text>
                  </div>
                )}
              </div>
            </Card>

            {/* Tài liệu */}
            <Card
              title={<><FileTextFilled style={{ color: "#10b981", marginRight: "8px" }} /> Tài liệu đính kèm</>}
              bordered={false}
              style={{ borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", height: "100%" }}
              headStyle={{ borderBottom: "1px solid #f1f5f9", fontWeight: 600, fontSize: "16px" }}
            >
              <Text type="secondary" style={{ display: "block", marginBottom: "16px" }}>
                Các file bổ sung (PDF, DOCX, ZIP) cho bài giảng.
              </Text>
              <Upload.Dragger
                customRequest={handleUploadDocument}
                showUploadList={false}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
                style={{ backgroundColor: "#f8fafc", borderColor: "#cbd5e1", borderRadius: "12px", padding: "16px 0" }}
              >
                <p className="ant-upload-drag-icon"><InboxOutlined style={{ color: "#10b981" }} /></p>
                <p className="ant-upload-text" style={{ fontSize: "15px", fontWeight: 500 }}>Nhấn hoặc kéo thả tài liệu vào đây</p>
              </Upload.Dragger>
              
              <div style={{ marginTop: "24px" }}>
                <Text strong style={{ display: "block", marginBottom: "12px" }}>Tài liệu hiện tại:</Text>
                {selectedLessonForSettings?.documents?.length > 0 ? (
                  <List
                    itemLayout="horizontal"
                    dataSource={selectedLessonForSettings.documents}
                    renderItem={(item) => {
                      const fileUrl = item.fileUrl?.startsWith("http") ? item.fileUrl : `http://localhost:9000/elearning/${item.fileUrl}`;
                      const isPdf = item.fileName?.toLowerCase().endsWith('.pdf') || item.fileUrl?.toLowerCase().endsWith('.pdf');
                      return (
                        <List.Item
                          style={{ backgroundColor: "#fff", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "8px" }}
                          actions={[<Button danger type="text" size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteDocument(item.documentId)} key="delete" />]}
                        >
                          <List.Item.Meta
                            avatar={<div style={{ width: "40px", height: "40px", backgroundColor: "#d1fae5", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}><FileTextFilled style={{ color: "#10b981", fontSize: "18px" }} /></div>}
                            title={<span style={{ fontSize: "13px", wordBreak: "break-all", fontWeight: 500 }}>{item.title}</span>}
                            description={
                              <a href={fileUrl} target="_blank" rel="noreferrer" download={!isPdf} style={{ fontSize: "12px", color: "#3b82f6", display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                                {isPdf ? <EyeOutlined /> : <DownloadOutlined />}
                                {isPdf ? "Xem trước" : "Tải xuống"}
                              </a>
                            }
                          />
                        </List.Item>
                      );
                    }}
                  />
                ) : (
                  <div style={{ padding: "16px", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px dashed #e2e8f0" }}>
                    <Text type="secondary" style={{ fontSize: "13px" }}>Chưa có tài liệu đính kèm.</Text>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </Modal>

      {/* Modal Thêm Câu Hỏi */}
      <Modal
        title="Thêm câu hỏi trắc nghiệm"
        open={isQuestionModalVisible}
        onOk={handleCreateQuestion}
        onCancel={() => setIsQuestionModalVisible(false)}
        okText="Lưu câu hỏi"
        cancelText="Hủy"
        confirmLoading={loading}
        width={600}
        destroyOnClose
      >
        <Form form={questionForm} layout="vertical">
          <Form.Item
            name="questionText"
            label="Nội dung câu hỏi"
            rules={[
              { required: true, message: "Vui lòng nhập nội dung câu hỏi" },
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Ví dụ: Đâu là thẻ HTML dùng để tạo liên kết?"
            />
          </Form.Item>
          <div style={{ marginBottom: "8px" }}>
            <Text strong>Các đáp án (Chọn một đáp án đúng):</Text>
          </div>
          <Form.Item name="correctAnswer" style={{ marginBottom: 0 }}>
            <Radio.Group style={{ width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {["A", "B", "C", "D"].map((letter, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <Radio value={idx} />
                    <Form.Item
                      name={`answer${idx}`}
                      noStyle
                      rules={[
                        { required: true, message: `Nhập đáp án ${letter}` },
                      ]}
                    >
                      <Input
                        placeholder={`Đáp án ${letter}`}
                        style={{ flex: 1 }}
                      />
                    </Form.Item>
                  </div>
                ))}
              </div>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Xem trước Video */}
      <Modal
        title={null}
        open={isPreviewModalVisible}
        onCancel={() => {
          setIsPreviewModalVisible(false);
          setPreviewVideoUrl("");
        }}
        footer={null}
        width={800}
        centered
        destroyOnClose
        closeIcon={
          <CloseCircleOutlined
            style={{
              color: "#fff",
              fontSize: "24px",
              backgroundColor: "rgba(0,0,0,0.5)",
              borderRadius: "50%",
            }}
          />
        }
        styles={{
          body: {
            padding: 0,
            backgroundColor: "#000",
            borderRadius: "8px",
            overflow: "hidden",
          },
        }}
      >
        {previewVideoUrl && (
          previewVideoUrl.includes("youtube.com") || previewVideoUrl.includes("youtu.be") ? (
            (() => {
              const match = previewVideoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
              const videoId = match ? match[1] : null;
              if (videoId) {
                return (
                  <iframe
                    width="100%"
                    height="450"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ display: "block", borderRadius: "8px" }}
                  ></iframe>
                );
              }
              return <div style={{ color: "white", padding: "20px", textAlign: "center" }}>Link YouTube không hợp lệ</div>;
            })()
          ) : (
            <video
              src={previewVideoUrl}
              controls
              autoPlay
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                maxHeight: "80vh",
              }}
            >
              Trình duyệt của bạn không hỗ trợ thẻ video.
            </video>
          )
        )}
      </Modal>
    </div>
  );
};

export default CurriculumTab;
