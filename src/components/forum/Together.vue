<template>
  <a-layout>
    <a-layout-content>
      <a-list item-layout="vertical" size="large">
        <a-list-item v-for="post in posts" :key="post.id">
          <a-list-item-meta>
            <template #title>
              <a-typography-title :level="3">
                {{ post.title }}
                <a-tag :color="getStatusColor(post.status)">
                  {{ getStatusText(post.status) }}
                </a-tag>
              </a-typography-title>
            </template>
            <template #description>
              <p>{{ post.content }}</p>
              <div class="post-meta">
                <span>发布时间: {{ formatDate(post.created_at) }}</span>
                <a-divider type="vertical" />
                <span> <like-outlined /> {{ post.stars_count }} </span>
              </div>
            </template>
          </a-list-item-meta>
          <img
            v-if="post.image_url"
            :src="getImageUrl(post.image_url)"
            alt="Post Image"
            class="post-image"
          />
        </a-list-item>
      </a-list>

      <!-- 分页组件 -->
      <div style="text-align: center; margin-top: 16px">
        <a-pagination
          v-model:current="currentPage"
          :total="total"
          :pageSize="pageSize"
          @change="handlePageChange"
          show-size-changer
          :pageSizeOptions="['5', '10', '20']"
          @showSizeChange="onShowSizeChange"
        />
      </div>
      <!--      <p>总帖子数: {{ total }} | 总页数: {{ pages }}</p>-->
    </a-layout-content>
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { message } from "ant-design-vue";
import { LikeOutlined } from "@ant-design/icons-vue";
import { Post } from "../../type/post";

const route = useRoute();
const router = useRouter();

const posts = ref<Post[]>([]);
const total = ref(0);
const pageSize = ref(5);
const currentPage = ref(1);
const loading = ref(false);

// 获取图片完整URL
const getImageUrl = (imageUrl: string | null) => {
  if (!imageUrl) return "";
  return `http://localhost:8080/${imageUrl}`;
};
// 获取状态文本
const getStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    0: "公告",
    1: "闲置",
    2: "求助",
    3: "搭子",
    4: "趣事",
  };
  return statusMap[status] || "未知";
};

// 获取状态标签颜色
const getStatusColor = (status: number) => {
  const colorMap: Record<number, string> = {
    0: "red", // 公告用红色
    1: "green", // 闲置用绿色
    2: "blue", // 求助用蓝色
    3: "purple", // 搭子用紫色
    4: "orange", // 趣事用橙色
  };
  return colorMap[status] || "";
};

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fetchPagePosts = async (page: number) => {
  loading.value = true;
  try {
    const response = await axios.get("/api/post/GetAllPosts", {
      params: {
        pageNum: page,
        pageSize: pageSize.value,
      },
    });
    posts.value = response.data.posts;
    total.value = response.data.total;
  } catch (error) {
    console.error("获取帖子失败:", error);
    message.error("获取帖子失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

// const pages = computed(() => {
//   return Math.ceil(total.value / pageSize.value);
// });

const handlePageChange = (newPage: number) => {
  router.push(`/forum/together/page/${newPage}`);
};

const onShowSizeChange = (current: number, size: number) => {
  pageSize.value = size;
  currentPage.value = current;
  fetchPagePosts(current);
};
watch(
  () => route.params.page,
  (newPage) => {
    const page = Number(newPage) || 1;
    currentPage.value = page;
    fetchPagePosts(page);
  },
  { immediate: true },
);
</script>

<style scoped>
.post-image {
  max-width: 200px;
  max-height: 200px;
  object-fit: cover;
  margin-top: 16px;
  border-radius: 4px;
}

.post-meta {
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
  margin-top: 8px;
}

.ant-list-item {
  padding: 16px;
  margin: 8px 0;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
</style>
