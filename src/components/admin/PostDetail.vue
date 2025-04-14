<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import axios from "axios";
import type { Post } from "../../types/post.ts";

const route = useRoute();
const router = useRouter();
const postId = route.params.id as string;
const post = ref<Post | null>(null);
const loading = ref(true);

// 获取帖子详情
const getPostDetail = async () => {
  loading.value = true;
  try {
    const { data } = await axios.get(`/api/post/admin/posts/${postId}`);
    post.value = data;
  } catch (error) {
    console.error("获取帖子详情失败:", error);
    ElMessage.error("获取帖子详情失败");
  } finally {
    loading.value = false;
  }
};

// 获取类型标签样式
const getTagType = (status: number) => {
  switch (status) {
    case 0:
      return "danger"; // 公告 - 红色
    case 1:
      return "info"; // 闲置 - 灰色
    case 2:
      return "warning"; // 求组 - 黄色
    case 3:
      return "success"; // 搭子 - 绿色
    case 4:
      return "primary"; // 趣事 - 蓝色
    default:
      return "info";
  }
};

// 修改审核状态
const changeAllow = async (newAllow: number) => {
  try {
    await axios.put(`/api/post/admin/posts/${postId}/allow`, {
      allow: newAllow,
    });
    ElMessage.success("审核状态更新成功");
    getPostDetail();
  } catch (error) {
    console.error("更新审核状态失败:", error);
    ElMessage.error("更新审核状态失败");
  }
};

// 审核通过
const approvePost = () => {
  changeAllow(1);
};

// 审核拒绝
const rejectPost = () => {
  changeAllow(-1);
};

// 重新审核
const resetReview = () => {
  changeAllow(0);
};

// 删除帖子
const deletePost = () => {
  ElMessageBox.confirm("确认删除该帖子吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      await axios.delete(`/api/post/admin/posts/${postId}`);
      ElMessage.success("删除成功");
      router.push("/admin/post/list");
    } catch (error) {
      console.error("删除失败:", error);
      ElMessage.error("删除失败");
    }
  });
};

// 返回列表
const goBack = () => {
  router.back();
};

const getImageUrl = (imageUrl: string | null) => {
  if (!imageUrl) return "";
  return `http://localhost:8080/${imageUrl}`;
};

onMounted(() => {
  getPostDetail();
});
</script>

<template>
  <div class="post-detail-page">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button @click="goBack">
              <el-icon><ArrowLeft /></el-icon> 返回
            </el-button>
            <span class="title">帖子详情</span>
          </div>
          <div class="header-right">
            <el-button-group>
              <template v-if="post?.allow === 0">
                <el-button type="success" @click="approvePost"
                  >通过审核</el-button
                >
                <el-button type="danger" @click="rejectPost"
                  >拒绝审核</el-button
                >
              </template>
              <template v-else-if="post?.allow === 1">
                <el-button type="danger" @click="rejectPost"
                  >拒绝审核</el-button
                >
                <el-button type="warning" @click="resetReview"
                  >重新审核</el-button
                >
              </template>
              <template v-else-if="post?.allow === -1">
                <el-button type="success" @click="approvePost"
                  >通过审核</el-button
                >
                <el-button type="warning" @click="resetReview"
                  >重新审核</el-button
                >
              </template>
              <el-button type="danger" @click="deletePost">删除帖子</el-button>
            </el-button-group>
          </div>
        </div>
      </template>

      <div v-if="post" class="post-content">
        <div class="post-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="帖子ID">{{
              post.id
            }}</el-descriptions-item>
            <el-descriptions-item label="作者ID">{{
              post.userId
            }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{
              post.createdAt
            }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{
              post.updatedAt
            }}</el-descriptions-item>
            <el-descriptions-item label="点赞数">{{
              post.starsCount
            }}</el-descriptions-item>
            <el-descriptions-item label="帖子类型">
              <el-tag :type="getTagType(post.status)">
                {{
                  post.status === 0
                    ? "公告"
                    : post.status === 1
                      ? "闲置"
                      : post.status === 2
                        ? "求组"
                        : post.status === 3
                          ? "搭子"
                          : "趣事"
                }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="审核状态">
              <el-tag
                :type="
                  post.allow === 1
                    ? 'success'
                    : post.allow === 0
                      ? 'warning'
                      : 'danger'
                "
              >
                {{
                  post.allow === 1
                    ? "已通过"
                    : post.allow === 0
                      ? "待审核"
                      : "已拒绝"
                }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="post-title">
          <h2>{{ post.title }}</h2>
        </div>

        <div class="post-image" v-if="post.imageUrl">
          <el-image
            :src="getImageUrl(post.imageUrl)"
            fit="contain"
            :preview-src-list="[getImageUrl(post.imageUrl)]"
          />
        </div>

        <div class="post-content-main">
          <div v-html="post.content"></div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.post-detail-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: bold;
  margin-left: 12px;
}

.post-content {
  margin-top: 10px;
}

.post-info {
  margin-bottom: 20px;
}

.post-title {
  margin: 20px 0;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.post-image {
  margin: 20px 0;
  text-align: center;
}

.post-image .el-image {
  max-height: 400px;
}

.post-content-main {
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #fafafa;
  min-height: 300px;
  line-height: 1.6;
}
</style>
