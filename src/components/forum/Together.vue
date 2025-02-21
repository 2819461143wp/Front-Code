<template>
  <a-layout>
    <a-layout-content>
      <a-list item-layout="vertical" size="middle">
        <a-list-item v-for="post in posts" :key="post.id">
          <a-list-item-meta>
            <template #title>
              <a-typography-title :level="3">{{
                post.title
              }}</a-typography-title>
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
      <div style="text-align: center; margin-top: 16px">
        <a-pagination
          v-model:current="currentPage"
          :total="total"
          :page-size="pageSize"
          @change="handlePageChange"
        />
      </div>
      <p>Total Posts: {{ total }}</p>
    </a-layout-content>
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { message } from "ant-design-vue";

const posts = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

const fetchPosts = async () => {
  try {
    const response = await axios.get("/api/post/GetPosts", {
      params: {
        pageNum: currentPage.value,
        pageSize: pageSize.value,
      },
    });
    posts.value = response.data.posts;
    total.value = response.data.total;
    console.log("posts:", posts.value);
  } catch (error) {
    console.error("Error fetching posts:", error);
    message.error("帖子获取失败，请稍后重试");
  }
};

const handlePageChange = (newPage) => {
  currentPage.value = newPage;
  fetchPosts();
};

onMounted(() => {
  fetchPosts();
});
</script>

<style scoped>
img {
  margin-top: 16px;
}
</style>
