import axiosClient from '../api/axiosClient';

const fileService = {
  // Hàm này dùng để upload file trực tiếp lên MinIO qua Presigned URL
  uploadFile: async (file) => {
    // 1. Lấy Presigned URL từ Backend
    const presignedRes = await axiosClient.get('/files/presigned-url', {
      params: {
        fileName: file.name,
        contentType: file.type || 'application/octet-stream'
      }
    });

    if (!presignedRes.success) {
      throw new Error("Không thể lấy Presigned URL");
    }

    const { presignedUrl, objectName, originalFilename, contentType } = presignedRes.data;

    // 2. Tải trực tiếp file lên MinIO (bỏ qua Backend)
    await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': contentType
      }
    });

    // 3. Báo cho Backend biết là đã upload xong để lưu Database
    const confirmRes = await axiosClient.post('/files/confirm', {
      originalFilename,
      objectName,
      contentType,
      fileSize: file.size
    });

    return confirmRes;
  },
};

export default fileService;
