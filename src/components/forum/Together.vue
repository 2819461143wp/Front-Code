<template>
  <a-layout>
    <a-layout-content>
      <a-list item-layout="vertical" size="middle">
        <a-list-item v-for="post in posts" :key="post.id">
          <a-list-item-meta>
            <template #title>
              <a-typography-title :level="3">
                {{ post.title }}
              </a-typography-title>
            </template>
            <template #description>
              <p>{{ post.content }}</p>
            </template>
          </a-list-item-meta>
          <img
            v-if="post.image_url"
            :src="'/' + post.image_url"
            alt="Post Image"
            style="max-width: 200px; max-height: 200px"
          />
        </a-list-item>
      </a-list>

      <!-- 分页组件 -->
      <div style="text-align: center; margin-top: 16px">
        <a-pagination
          v-model:current="currentPage"
          :total="total"
          :page-size="pageSize"
          @change="handlePageChange"
        />
      </div>

      <p>Total Posts: {{ total }} | Total Pages: {{ pages }}</p>
    </a-layout-content>
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { message } from "ant-design-vue";

const route = useRoute();
const router = useRouter();

const posts = ref([]);
const total = ref(0);
const pageSize = ref(5);
const currentPage = ref(1);
const loading = ref(false);

// 获取指定页的帖子
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
    console.error("Error fetching posts:", error);
    message.error("帖子获取失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

// 计算总页数
const pages = computed(() => {
  return Math.ceil(total.value / pageSize.value);
});

// 处理分页切换
const handlePageChange = (newPage: number) => {
  router.push(`/forum/together/page/${newPage}`);
};

// 监听路由参数变化
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
img {
  margin-top: 16px;
}
</style>
