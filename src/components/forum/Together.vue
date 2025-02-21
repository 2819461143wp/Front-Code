<template>
  <div>
    <el-card>
      <!-- 帖子列表 -->
      <div v-for="post in posts" :key="post.id" class="post-item">
        <el-card>
          <div class="post-header">
            <span>用户ID: {{ post.user_id }}</span>
            <span>发布时间: {{ post.created_at }}</span>
          </div>
          <h3>{{ post.title }}</h3>
          <p>{{ post.content }}</p>
          <div v-if="post.image_url">
            <img
              :src="getFullImageUrl(post.image_url)"
              class="post-image"
              alt="Post Image"
            />
          </div>
        </el-card>
      </div>

      <!-- 分页 -->
      <el-pagination
        background
        layout="prev, pager, next"
        :total="totalPosts"
        :current-page="currentPage"
        :page-size="pageSize"
        @current-change="handlePageChange"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { ElMessage } from "element-plus";

const posts = ref([]); // 帖子列表数据
const currentPage = ref(1); // 当前页码
const pageSize = ref(10); // 每页显示的数量
const totalPosts = ref(0); // 总帖子数量

// 获取帖子列表
const fetchPosts = async () => {
  try {
    const response = await axios.get("/api/post/getPosts", {
      params: {
        pageNum: currentPage.value,
        pageSize: pageSize.value,
      },
    });
    posts.value = response.data.posts; // 帖子数据
    totalPosts.value = response.data.total; // 总帖子数
  } catch (error) {
    ElMessage.error("获取帖子列表失败，请稍后再试");
  }
};

// 处理分页变化
const handlePageChange = (newPage) => {
  currentPage.value = newPage;
  fetchPosts();
};

// 获取完整的图片 URL
const getFullImageUrl = (relativePath) => {
  // 这里需要根据后端文件的实际路径拼接完整 URL
  // 示例：假设文件存储在 `/api/files` 路径下
  return `/api/files/${relativePath}`;
};

// 页面加载时获取帖子列表
onMounted(() => {
  fetchPosts();
});
</script>

<style scoped>
.post-item {
  margin-bottom: 20px;
}

.post-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.post-image {
  max-width: 100%;
  height: auto;
  margin-top: 10px;
}
</style>
