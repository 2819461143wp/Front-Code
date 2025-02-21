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
const fileList = ref<UploadFile[]>([]);

const submitPost = async () => {
  const formData = new FormData();
  formData.append("user_id", store.userId);
  formData.append("title", title.value);
  formData.append("content", content.value);
  // 上传头像文件
  if (fileList.value.length > 0 && fileList.value[0].originFileObj) {
    formData.append("file", fileList.value[0].originFileObj);
  } else {
    console.log("文件列表为空");
  }

  try {
    const response = await axios.post("/api/post/Insert", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.data == "发表贴子成功") {
      message.success("发表贴子成功");
      router.push("/forum/together");
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
</style>
