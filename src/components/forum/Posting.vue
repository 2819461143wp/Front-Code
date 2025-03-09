<template>
  <div class="posting-container">
    <a-card title="发帖子" class="posting-card">
      <a-form @submit.prevent="submitPost">
        <a-form-item label="标题">
          <a-input
            v-model:value="title"
            show-count
            :maxlength="20"
            placeholder="请输入标题"
          />
        </a-form-item>
        <a-form-item label="内容">
          <a-textarea
            v-model:value="content"
            placeholder="请输入内容"
            auto-size
          />
        </a-form-item>
        <a-form-item label="上传文件">
          <a-upload
            action="/upload.do"
            list-type="picture-card"
            v-model:fileList="fileList"
          >
            <div>
              <PlusOutlined />
              <div style="margin-top: 8px">Upload</div>
            </div>
          </a-upload>
        </a-form-item>
        <!-- 选择帖子属性 -->
        <a-form-item label="帖子类型">
          <a-radio-group v-model:value="selectedCategory">
            <a-radio-button value="1">闲置</a-radio-button>
            <a-radio-button value="2">求助</a-radio-button>
            <a-radio-button value="3">搭子</a-radio-button>
            <a-radio-button value="4">趣事</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">提交</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { PlusOutlined } from "@ant-design/icons-vue";
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

  fileList.value.forEach((file) => {
    if (file.originFileObj) {
      formData.append("files", file.originFileObj);
    }
  });

  try {
    const response = await axios.post("/api/post/Insert", formData, {
      headers: { "Content-Type": "multipart/form-data" },
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
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
  background-color: #f0f2f5;
}

.posting-card {
  width: 600px;
}

a-button-group {
  display: flex;
  gap: 8px;
}

:deep(.ant-radio-button-wrapper-checked) {
  background-color: #1890ff !important;
  border-color: #1890ff !important;
  color: #fff !important;
}

:deep(.ant-radio-button-wrapper:hover) {
  color: #1890ff;
}

:deep(.ant-radio-button-wrapper) {
  transition: all 0.3s;
}
</style>
