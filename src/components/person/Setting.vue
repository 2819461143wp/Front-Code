<template>
  <div class="setting-container">
    <a-card class="setting-card" :bordered="false">
      <div class="card-header">
        <h2>个人设置</h2>
        <p class="subtitle">更新你的个人信息</p>
      </div>

      <a-form layout="vertical" @submit.prevent="submitPost">
        <div class="avatar-section">
          <p class="section-title">头像</p>
          <a-upload
            :data="{ userId: store.userId }"
            list-type="picture-circle"
            v-model:fileList="fileList"
            :show-upload-list="false"
          >
            <div class="upload-button">
              <div v-if="fileList.length === 0">
                <PlusOutlined />
                <div>上传头像</div>
              </div>
              <img
                v-else
                :src="previewUrl"
                alt="avatar"
                class="avatar-preview"
              />
            </div>
          </a-upload>
        </div>

        <a-form-item>
          <template #label>
            <span class="form-label">昵称</span>
          </template>
          <a-input
            v-model:value="name"
            show-count
            :maxlength="20"
            placeholder="请输入昵称"
            size="large"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item>
          <template #label>
            <span class="form-label">个人简介</span>
          </template>
          <a-textarea
            v-model:value="biography"
            placeholder="介绍一下你自己..."
            :auto-size="{ minRows: 4, maxRows: 6 }"
            :maxlength="200"
            show-count
          />
        </a-form-item>

        <div class="button-group">
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            :loading="loading"
          >
            保存更改
          </a-button>
          <a-button size="large" @click="router.back()">取消</a-button>
        </div>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from "vue";
import { PlusOutlined, UserOutlined } from "@ant-design/icons-vue";
import axios from "axios";
import { store } from "../../store";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";

const router = useRouter();

interface UploadFile {
  uid: string;
  name: string;
  originFileObj?: File;
}

const name = ref("");
const biography = ref("");
const fileList = ref<UploadFile[]>([]);

const submitPost = async () => {
  const formData = new FormData();
  formData.append("userId", store.userId);
  formData.append("name", name.value);
  formData.append("biography", biography.value);

  // 上传头像文件
  if (fileList.value.length > 0 && fileList.value[0].originFileObj) {
    formData.append("file", fileList.value[0].originFileObj);
  }

  try {
    const response = await axios.post("/api/character/update", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.data == "用户信息更新成功") {
      if (name.value.trim() !== "") {
        store.updateName(name.value);
      }
      message.success("修改信息成功");
      router.push("/person/center");
    } else {
      message.error("后端更新出现问题");
    }
  } catch (error) {
    message.error("未连接到后端的相应接口");
  }
};
const loading = ref(false);
// 添加预览图片的计算属性
const previewUrl = computed(() => {
  if (fileList.value.length > 0 && fileList.value[0].originFileObj) {
    return window.URL.createObjectURL(fileList.value[0].originFileObj);
  }
  return "";
});

// 组件卸载时清理 URL 对象
onUnmounted(() => {
  if (previewUrl.value) {
    window.URL.revokeObjectURL(previewUrl.value);
  }
});
</script>

<style scoped>
.setting-container {
  min-height: 100vh;
  padding: 24px;
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.setting-card {
  width: 100%;
  max-width: 600px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-header {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.card-header h2 {
  font-size: 24px;
  color: #1890ff;
  margin-bottom: 8px;
}

.subtitle {
  color: #8c8c8c;
  font-size: 14px;
}

.avatar-section {
  text-align: center;
  margin-bottom: 32px;
}

.section-title {
  color: #595959;
  margin-bottom: 16px;
  font-size: 16px;
}

.form-label {
  color: #595959;
  font-size: 14px;
}

:deep(.ant-upload.ant-upload-select-picture-circle) {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 2px dashed #d9d9d9;
  background-color: #fafafa;
}

:deep(.ant-upload.ant-upload-select-picture-circle:hover) {
  border-color: #1890ff;
}

.upload-button {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #8c8c8c;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

:deep(.ant-input-affix-wrapper) {
  border-radius: 6px;
}

:deep(.ant-input) {
  border-radius: 6px;
}

.button-group {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 32px;
}

:deep(.ant-btn) {
  min-width: 120px;
  border-radius: 6px;
}

@media (max-width: 576px) {
  .setting-container {
    padding: 12px;
  }

  .button-group {
    flex-direction: column;
  }

  :deep(.ant-btn) {
    width: 100%;
  }
}
</style>
