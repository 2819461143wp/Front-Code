<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import axios from "axios";
import { UploadFilled, RefreshRight, Delete } from "@element-plus/icons-vue";

// 定义上传文件的接口
interface UploadFile {
  name: string;
  percentage?: number;
  status: string;
  size: number;
  raw: File;
  uid: number | string;
  url?: string;
  type?: string;
}

// 定义文档信息接口
interface DocumentInfo {
  filename: string;
  description: string;
  uploadTime: string;
  fileSize: number;
}

const fileList = ref<UploadFile[]>([]);
const description = ref("");
const uploadLoading = ref(false);
const indexLoading = ref(false);
const documents = ref<DocumentInfo[]>([]);
const loading = ref(false);

// 获取文档列表
const getDocuments = async (): Promise<void> => {
  loading.value = true;
  try {
    const response = await axios.get<DocumentInfo[]>("/api/documents/list");
    documents.value = response.data;
  } catch (error: any) {
    console.error("获取文档列表失败:", error);
    let errorMsg = "未知错误";
    if (error.response) {
      errorMsg = error.response.data || error.response.statusText;
    } else if (error.message) {
      errorMsg = error.message;
    }
    ElMessage.error("获取文档列表失败: " + errorMsg);
  } finally {
    loading.value = false;
  }
};

// 删除文档
const deleteDocument = async (filename: string): Promise<void> => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文档"${filename}"吗？此操作不可逆`,
      "警告",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      },
    );
    await axios.delete(`/api/documents/${filename}`);
    ElMessage.success("文档删除成功");
    // 重新获取文档列表
    getDocuments();
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除文档失败:", error);
      let errorMsg = "未知错误";
      if (error.response) {
        errorMsg = error.response.data || error.response.statusText;
      } else if (error.message) {
        errorMsg = error.message;
      }
      ElMessage.error("删除文档失败: " + errorMsg);
    }
  }
};

// 格式化文件大小
const formatFileSize = (size: number): string => {
  if (size < 1024) {
    return size + " B";
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + " KB";
  } else {
    return (size / (1024 * 1024)).toFixed(2) + " MB";
  }
};

// 页面加载时获取文档列表
onMounted(() => {
  getDocuments();
});

// 文件上传之前的验证
const beforeUpload = (file: File): boolean => {
  const isPDF = file.type === "application/pdf";
  const isDocx =
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const isTxt = file.type === "text/plain";

  if (!isPDF && !isDocx && !isTxt) {
    ElMessage.error("只能上传PDF、DOCX或TXT文件!");
    return false;
  }

  const isLessThan50M = file.size / 1024 / 1024 < 50;
  if (!isLessThan50M) {
    ElMessage.error("文件大小不能超过50MB!");
    return false;
  }

  return true;
};

// 文件上传
const handleUpload = async (): Promise<void> => {
  if (fileList.value.length === 0) {
    ElMessage.warning("请选择要上传的文件");
    return;
  }

  uploadLoading.value = true;
  try {
    const formData = new FormData();
    formData.append("file", fileList.value[0].raw);
    if (description.value.trim()) {
      formData.append("description", description.value);
    }

    await axios.post("/api/documents/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    ElMessage.success("文档上传成功");
    fileList.value = [];
    description.value = "";
    // 上传成功后刷新文档列表
    getDocuments();
  } catch (error: any) {
    console.error("上传失败:", error);
    let errorMsg = "未知错误";
    if (error.response) {
      errorMsg = error.response.data || error.response.statusText;
    } else if (error.message) {
      errorMsg = error.message;
    }
    ElMessage.error("文档上传失败: " + errorMsg);
  } finally {
    uploadLoading.value = false;
  }
};

// 重建索引
const rebuildIndex = async (): Promise<void> => {
  try {
    await ElMessageBox.confirm(
      "重建索引可能需要一些时间，确定要继续吗？",
      "确认操作",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      },
    );

    indexLoading.value = true;
    await axios.get("/api/documents/reindex");
    ElMessage.success("索引重建成功");
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("重建索引失败:", error);
      let errorMsg = "未知错误";
      if (error.response) {
        errorMsg = error.response.data || error.response.statusText;
      } else if (error.message) {
        errorMsg = error.message;
      }
      ElMessage.error("索引重建失败: " + errorMsg);
    }
  } finally {
    indexLoading.value = false;
  }
};

// 文件变化处理
const handleFileChange = (
  _uploadFile: UploadFile,
  uploadFiles: UploadFile[],
): void => {
  fileList.value = uploadFiles;
};

// 移除文件
const handleRemove = (_file: UploadFile, uploadFiles: UploadFile[]): void => {
  fileList.value = uploadFiles;
};
</script>

<template>
  <div class="knowledge-base-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h2>知识库文档管理</h2>
        </div>
      </template>

      <div class="upload-section">
        <h3>上传文档</h3>
        <p class="description">支持PDF、DOCX、TXT文件，最大50MB</p>

        <el-form label-width="120px">
          <el-form-item label="文档描述">
            <el-input
              v-model="description"
              type="textarea"
              :rows="3"
              placeholder="请输入文档描述（可选）"
            />
          </el-form-item>

          <el-form-item label="选择文件">
            <el-upload
              class="upload-demo"
              drag
              action="#"
              :auto-upload="false"
              :limit="1"
              :on-change="handleFileChange"
              :on-remove="handleRemove"
              :before-upload="beforeUpload"
              :file-list="fileList"
            >
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text">
                拖拽文件到此处或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  只能上传PDF、DOCX或TXT文件，且不超过50MB
                </div>
              </template>
            </el-upload>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="handleUpload"
              :loading="uploadLoading"
              :disabled="fileList.length === 0"
            >
              上传文档
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-divider />

      <div class="documents-section">
        <h3>文档列表</h3>
        <p class="description">已上传的知识库文档</p>

        <el-table
          :data="documents"
          style="width: 100%"
          v-loading="loading"
          border
          stripe
        >
          <el-table-column prop="filename" label="文件名" width="250" />
          <el-table-column
            prop="description"
            label="描述"
            show-overflow-tooltip
          />
          <el-table-column label="大小" width="120">
            <template #default="scope">
              {{ formatFileSize(scope.row.fileSize) }}
            </template>
          </el-table-column>
          <el-table-column label="上传时间" width="180">
            <template #default="scope">
              {{ new Date(scope.row.uploadTime).toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button
                type="danger"
                size="small"
                @click="deleteDocument(scope.row.filename)"
                circle
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-divider />

      <div class="index-section">
        <h3>索引管理</h3>
        <p class="description">文档上传后需要重建索引才能被检索</p>

        <el-button type="warning" @click="rebuildIndex" :loading="indexLoading">
          <el-icon><RefreshRight /></el-icon>
          重建知识库索引
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.knowledge-base-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-section,
.index-section,
.documents-section {
  margin-bottom: 20px;
}

.description {
  color: #909399;
  font-size: 14px;
  margin-bottom: 20px;
}

.upload-demo {
  width: 100%;
}

h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-weight: 500;
  font-size: 18px;
  color: #303133;
}

.el-upload__tip {
  line-height: 1.2;
}
</style>
