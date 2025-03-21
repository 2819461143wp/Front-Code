<template>
  <div class="posting-container">
    <a-card class="posting-card" :bordered="false">
      <div class="card-title">
        <h2>发布新帖子</h2>
        <p class="subtitle">分享你的想法...</p>
      </div>

      <a-form layout="vertical" @submit.prevent="submitPost">
        <a-form-item>
          <div class="category-selector">
            <span class="category-label">选择分类：</span>
            <a-radio-group
              v-model:value="selectedCategory"
              button-style="solid"
            >
              <a-radio-button value="1">闲置</a-radio-button>
              <a-radio-button value="2">求助</a-radio-button>
              <a-radio-button value="3">搭子</a-radio-button>
              <a-radio-button value="4">趣事</a-radio-button>
            </a-radio-group>
          </div>
        </a-form-item>

        <a-form-item>
          <a-input
            v-model:value="title"
            placeholder="请输入标题..."
            :maxlength="20"
            class="title-input"
            size="large"
          >
            <template #prefix>
              <FileTextOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item>
          <a-textarea
            v-model:value="content"
            placeholder="分享你的想法..."
            :auto-size="{ minRows: 6, maxRows: 12 }"
            class="content-input"
          />
        </a-form-item>

        <a-form-item>
          <div class="upload-section">
            <p class="upload-title"><PaperClipOutlined /> 添加图片</p>
            <a-upload
              :action="null"
              :beforeUpload="() => false"
              list-type="picture-card"
              v-model:fileList="fileList"
              :maxCount="1"
              accept="image/*"
            >
              <div v-if="fileList.length < 1" class="upload-button">
                <PlusOutlined />
                <div>点击上传</div>
              </div>
            </a-upload>
          </div>
        </a-form-item>

        <div class="submit-section">
          <a-button type="primary" html-type="submit" size="large">
            <template #icon>
              <SendOutlined />
            </template>
            发布帖子
          </a-button>
          <a-button size="large" @click="router.back()">取消</a-button>
        </div>
      </a-form>
    </a-card>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import {
  PlusOutlined,
  FileTextOutlined,
  SendOutlined,
  PaperClipOutlined,
} from "@ant-design/icons-vue";
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

const title = ref("");
const content = ref("");
const selectedCategory = ref<number>(1);
const fileList = ref<UploadFile[]>([]);

const submitPost = async () => {
  if (!title.value.trim()) {
    message.error("标题不能为空");
    return;
  }
  if (!content.value.trim()) {
    message.error("内容不能为空");
    return;
  }
  if (!selectedCategory.value) {
    message.error("请选择帖子类型");
    return;
  }
  if (!store.userId) {
    message.error("用户未登录，请先登录！");
    return;
  }

  const formData = new FormData();
  formData.append("user_id", store.userId);
  formData.append("title", title.value);
  formData.append("content", content.value);
  formData.append("status", selectedCategory.value.toString());

  // 添加调试信息
  if (fileList.value.length > 0) {
    const file = fileList.value[0].originFileObj;
    if (file) {
      formData.append("file", file);
      console.log("文件名:", file.name);
      console.log("文件大小:", file.size);
      console.log("文件类型:", file.type);
    }
  } else {
    console.log("没有选择文件");
  }

  try {
    console.log("发送请求前的 FormData 内容:");
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    const response = await axios.post("/api/post/Insert", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        // 添加这行以防止浏览器自动设置 boundary
        Accept: "application/json",
      },
    });
    if (response.data == "发表贴子成功") {
      message.success("发表贴子成功");
      router.push("/forum/together/page/1");
    } else {
      message.error("后端更新出现问题");
    }
  } catch (error) {
    message.error("未连接到后端的相应接口");
  }
};
</script>

<style scoped>
.posting-container {
  min-height: 100vh;
  padding: 24px;
  background-color: #f5f5f5;
}

.posting-card {
  max-width: 800px;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-title {
  text-align: center;
  margin-bottom: 32px;
}

.card-title h2 {
  font-size: 24px;
  color: #1890ff;
  margin-bottom: 8px;
}

.subtitle {
  color: #8c8c8c;
  font-size: 14px;
}

.category-selector {
  margin-bottom: 24px;
}

.category-label {
  display: inline-block;
  margin-right: 16px;
  color: #595959;
}

.title-input {
  font-size: 16px;
  border-radius: 6px;
}

.content-input {
  font-size: 14px;
  border-radius: 6px;
  resize: none;
}

.upload-section {
  background-color: #fafafa;
  padding: 16px;
  border-radius: 6px;
}

.upload-title {
  margin-bottom: 16px;
  color: #595959;
  font-size: 14px;
}

.upload-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8c8c8c;
}

.submit-section {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 32px;
}

:deep(.ant-radio-button-wrapper-checked) {
  background-color: #1890ff !important;
  border-color: #1890ff !important;
  color: #fff !important;
}

:deep(.ant-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.ant-radio-button-wrapper) {
  border-radius: 6px !important;
  padding: 4px 16px;
}

:deep(.ant-radio-button-wrapper:first-child) {
  border-radius: 6px !important;
}

:deep(.ant-radio-button-wrapper:last-child) {
  border-radius: 6px !important;
}

:deep(.ant-upload-list-picture-card-container),
:deep(.ant-upload.ant-upload-select-picture-card) {
  width: 150px;
  height: 150px;
  border-radius: 8px;
}

@media (max-width: 576px) {
  .posting-container {
    padding: 12px;
  }

  .category-selector {
    flex-direction: column;
    gap: 12px;
  }

  .submit-section {
    flex-direction: column;
  }
}
</style>
