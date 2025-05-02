<template>
  <a-layout>
    <a-layout-content>
      <a-list item-layout="vertical" size="default">
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
              <div class="post-time">
                <span>发布时间: {{ formatDate(post.createdAt) }}</span>
              </div>
            </template>
          </a-list-item-meta>
          <img
            v-if="post.imageUrl"
            :src="getImageUrl(post.imageUrl)"
            alt="Post Image"
            class="post-image"
          />

          <!-- 交互操作栏 -->
          <div class="post-actions">
            <div class="action-item" @click="handleLikeToggle(post)">
              <like-filled v-if="post.isLiked" class="action-icon liked" />
              <like-outlined v-else class="action-icon" />
              <span class="action-text">{{ post.starsCount || 0 }}</span>
            </div>

            <div class="action-item" @click="showComments(post.id)">
              <message-outlined class="action-icon" />
              <span class="action-text">{{ post.commentsCount || 0 }}</span>
            </div>

            <!-- 收藏按钮 -->
            <div class="action-item" @click="handleFavoriteToggle(post)">
              <star-filled
                v-if="favoritedPosts.has(post.id)"
                class="action-icon favorited"
              />
              <star-outlined v-else class="action-icon" />
              <span class="action-text">{{ post.favoritesCount || 0 }}</span>
            </div>
          </div>

          <!-- 评论区域 -->
          <div v-if="activeCommentPostId === post.id" class="comments-section">
            <a-divider style="margin: 12px 0" />

            <!-- 评论列表 -->
            <a-list
              v-if="comments.length > 0"
              class="comment-list"
              :data-source="comments"
            >
              <a-list-item v-for="comment in comments" :key="comment.id">
                <a-list-item-meta>
                  <template #avatar>
                    <a-avatar
                      :src="
                        comment.characterAvatar
                          ? `http://localhost:8080/${comment.characterAvatar}`
                          : ''
                      "
                    />
                  </template>
                  <template #title>
                    <span>{{ comment.characterName }}</span>
                    <span class="comment-time">{{
                      formatDate(comment.createdAt)
                    }}</span>
                  </template>
                  <template #description>
                    <p class="comment-content">{{ comment.content }}</p>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </a-list>
            <div v-else class="empty-comments">
              暂无评论，快来发表第一条评论吧~
            </div>

            <!-- 添加评论 -->
            <div class="comment-form">
              <a-textarea
                v-model:value="newComment"
                :rows="2"
                placeholder="发表你的评论..."
                :maxlength="200"
                show-count
              />
              <a-button
                type="primary"
                @click="submitComment(post.id)"
                :disabled="!newComment.trim()"
                :loading="submitting"
                style="margin-top: 8px"
              >
                发表评论
              </a-button>
            </div>
          </div>
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
    </a-layout-content>
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { message } from "ant-design-vue";
import {
  LikeOutlined,
  LikeFilled,
  MessageOutlined,
  StarOutlined,
  StarFilled,
} from "@ant-design/icons-vue";
import { Post } from "../../types/post";
import { store } from "../../store";

const route = useRoute();
const router = useRouter();

const posts = ref<Post[]>([]);
const total = ref(0);
const pageSize = ref(5);
const currentPage = ref(1);
const loading = ref(false);
const likedPosts = ref<Set<number>>(new Set());
const favoritedPosts = ref<Set<number>>(new Set());

// 评论相关状态
const comments = ref<any[]>([]);
const activeCommentPostId = ref<number | null>(null);
const newComment = ref("");
const submitting = ref(false);

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

// 处理点赞/取消点赞
const handleLikeToggle = async (post: Post) => {
  const userId = store.userId;
  if (!userId) {
    message.warning("请先登录后再点赞");
    return;
  }

  try {
    if (!post.isLiked) {
      // 点赞
      const response = await axios.get("/api/like/incrementlike", {
        params: {
          userId: userId,
          postId: post.id,
        },
      });

      if (response.data === "点赞成功") {
        post.starsCount++;
        post.likesCount = post.starsCount;
        post.isLiked = true;
        likedPosts.value.add(post.id);
        message.success("点赞成功");
      }
    } else {
      // 取消点赞
      const response = await axios.get("/api/like/decrementlike", {
        params: {
          userId: userId,
          postId: post.id,
        },
      });

      if (response.data === "取消点赞成功") {
        post.starsCount--;
        post.likesCount = post.starsCount;
        post.isLiked = false;
        likedPosts.value.delete(post.id);
        message.success("已取消点赞");
      }
    }
  } catch (error: any) {
    console.error("点赞操作失败:", error);
    if (error.response && error.response.data) {
      message.error(error.response.data);
    } else {
      message.error("操作失败，请稍后再试");
    }
  }
};

// 获取点赞状态
const fetchUserLikeStatus = async (posts: Post[]) => {
  if (!store.userId || posts.length === 0) return;

  try {
    const response = await axios.get("/api/like/getUserLikes", {
      params: {
        userId: store.userId,
        postIds: posts.map((post) => post.id).join(","),
      },
    });

    const likedPostIds: number[] = response.data || [];
    likedPosts.value = new Set(likedPostIds);

    posts.forEach((post) => {
      post.isLiked = likedPosts.value.has(post.id);
    });
  } catch (error) {
    console.error("获取点赞状态失败:", error);
  }
};

// 处理收藏/取消收藏
const handleFavoriteToggle = async (post: Post) => {
  const userId = store.userId;
  if (!userId) {
    message.warning("请先登录后再收藏");
    return;
  }

  try {
    const isFavorited = favoritedPosts.value.has(post.id);

    if (!isFavorited) {
      // 添加收藏
      const response = await axios.get("/api/favorite/increment", {
        params: {
          userId: userId,
          postId: post.id,
        },
      });

      if (response.data === "收藏成功") {
        post.favoritesCount++;
        favoritedPosts.value.add(post.id);
        message.success("收藏成功");
      }
    } else {
      // 取消收藏
      const response = await axios.get("/api/favorite/decrement", {
        params: {
          userId: userId,
          postId: post.id,
        },
      });

      if (response.data === "取消收藏成功") {
        post.favoritesCount--;
        favoritedPosts.value.delete(post.id);
        message.success("已取消收藏");
      }
    }
  } catch (error: any) {
    console.error("收藏操作失败:", error);
    if (error.response && error.response.data) {
      message.error(error.response.data);
    } else {
      message.error("操作失败，请稍后再试");
    }
  }
};

// 获取用户收藏状态
const fetchUserFavoriteStatus = async (posts: Post[]) => {
  if (!store.userId || posts.length === 0) return;

  try {
    const response = await axios.get("/api/favorite/getUserFavorites", {
      params: {
        userId: store.userId,
        postIds: posts.map((post) => post.id).join(","),
      },
    });

    const favoritedPostIds: number[] = response.data || [];
    favoritedPosts.value = new Set(favoritedPostIds);
  } catch (error) {
    console.error("获取收藏状态失败:", error);
  }
};

// 显示评论
const showComments = async (postId: number) => {
  if (activeCommentPostId.value === postId) {
    // 如果点击的是当前已展开的评论区，则关闭它
    activeCommentPostId.value = null;
    comments.value = [];
    return;
  }

  activeCommentPostId.value = postId;
  fetchComments(postId);
};

// 获取帖子评论
const fetchComments = async (postId: number) => {
  try {
    const response = await axios.get("/api/comment/getPostComments", {
      params: {
        postId: postId,
      },
    });
    comments.value = response.data || [];
  } catch (error) {
    console.error("获取评论失败:", error);
    message.error("获取评论失败，请稍后重试");
  }
};

// 提交评论
const submitComment = async (postId: number) => {
  if (!store.userId) {
    message.warning("请先登录后再评论");
    return;
  }

  if (!newComment.value.trim()) {
    message.warning("评论内容不能为空");
    return;
  }

  submitting.value = true;
  try {
    const formData = new FormData();
    formData.append("userId", store.userId.toString());
    formData.append("postId", postId.toString());
    formData.append("content", newComment.value);

    const response = await axios.post("/api/comment/insert", formData);

    if (response.data === "评论成功") {
      message.success("评论成功");
      newComment.value = "";
      // 重新获取评论列表
      fetchComments(postId);

      // 更新评论数
      const post = posts.value.find((p) => p.id === postId);
      if (post) {
        post.commentsCount = (post.commentsCount || 0) + 1;
      }
    }
  } catch (error: any) {
    console.error("提交评论失败:", error);
    if (error.response && error.response.data) {
      message.error(error.response.data);
    } else {
      message.error("提交评论失败，请稍后再试");
    }
  } finally {
    submitting.value = false;
  }
};

// 修改 fetchPagePosts 方法
const fetchPagePosts = async (page: number) => {
  loading.value = true;
  try {
    const response = await axios.get("/api/post/GetAllPosts", {
      params: {
        pageNum: page,
        pageSize: pageSize.value,
      },
    });

    posts.value = response.data.posts.map((post: Post) => ({
      ...post,
      starsCount: post.likesCount, // 确保 starsCount 和 likesCount 一致
      isLiked: false, // 初始化点赞状态
    }));

    total.value = response.data.total;

    // 获取点赞状态
    if (store.isLoggedIn) {
      await fetchUserLikeStatus(posts.value);
      await fetchUserFavoriteStatus(posts.value);
    }
  } catch (error) {
    console.error("获取帖子失败:", error);
    message.error("获取帖子失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

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

// 用户登录状态变化时，重新获取点赞状态
watch(
  () => store.isLoggedIn,
  (isLoggedIn) => {
    if (isLoggedIn && posts.value.length > 0) {
      fetchUserLikeStatus(posts.value);
    }
  },
);

onMounted(() => {
  // 如果已经登录，获取点赞状态
  if (store.isLoggedIn && posts.value.length > 0) {
    fetchUserLikeStatus(posts.value);
    fetchUserFavoriteStatus(posts.value);
  }
});
</script>

<style scoped>
.post-image {
  max-width: 200px;
  max-height: 200px;
  object-fit: cover;
  margin-top: 16px;
  border-radius: 4px;
}

.post-time {
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
  margin-top: 8px;
}

.ant-list-item {
  padding: 16px;
  margin: 8px 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.post-actions {
  display: flex;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.action-item {
  display: flex;
  align-items: center;
  margin-right: 48px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-item:hover {
  opacity: 0.8;
}

.action-icon {
  font-size: 18px;
  margin-right: 6px;
  color: #8c8c8c;
}

.action-icon.liked {
  color: #ff4d4f;
}

.action-text {
  font-size: 14px;
  color: #8c8c8c;
}

.action-item:hover .action-icon:not(.liked),
.action-item:hover .action-text {
  color: #1890ff;
}

.action-item:hover .action-icon.liked {
  color: #ff7875;
}

.action-icon.favorited {
  color: #faad14;
}

.action-item:hover .action-icon.favorited {
  color: #ffc53d;
}

/* 评论区域样式 */
.comments-section {
  margin-top: 8px;
  background-color: #fafafa;
  border-radius: 4px;
  padding: 8px 16px;
  transition: all 0.3s ease;
  max-height: 400px;
  overflow-y: auto;
}

.comment-list {
  margin-bottom: 16px;
}

.comment-time {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  margin-left: 8px;
}

.comment-content {
  margin: 0;
  white-space: pre-wrap;
}

.comment-form {
  margin-top: 16px;
}

.empty-comments {
  color: rgba(0, 0, 0, 0.45);
  text-align: center;
  padding: 16px;
}
</style>
