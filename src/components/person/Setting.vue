<template>
  <div class="posting-container">
    <a-card title="设置" class="posting-card">
      <a-form @submit.prevent="submitPost">
        <a-form-item label="头像">
          <a-upload
            :data="{ userId: store.userId }"
            list-type="picture-card"
            v-model:fileList="fileList"
          >
            <div>
              <PlusOutlined />
              <div style="margin-top: 8px">Upload</div>
            </div>
          </a-upload>
        </a-form-item>

        <a-form-item label="昵称">
          <a-input
            v-model:value="name"
            show-count
            :maxlength="20"
            placeholder="请输入昵称"
          />
        </a-form-item>

        <a-form-item label="个人简介">
          <a-textarea
            v-model:value="biography"
            placeholder="请输入个人简介"
            auto-size
          />
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
