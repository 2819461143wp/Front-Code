<template>
  <a-layout>
    <a-layout-content>
      <a-list item-layout="vertical" size="default">
        <a-list-item v-for="post in posts" :key="post.id">
          <a-list-item-meta>
            <template #title>
              <a-typography-title
                :level="3"
                class="post-title"
                @click="openPostDetail(post.id)"
              >
                {{ post.title }}
                <a-tag :color="getStatusColor(post.status)">
                  {{ getStatusText(post.status) }}
                </a-tag>
              </a-typography-title>
            </template>
            <template #description>
              <p class="post-content" @click="openPostDetail(post.id)">
                {{ truncateContent(post.content) }}
                <a-typography-link v-if="isContentTruncated(post.content)">
                  查看更多
                </a-typography-link>
              </p>
              <div class="post-meta">
                <span>发布时间: {{ formatDate(post.createdAt) }}</span>
                <a-divider type="vertical" />
                <span>作者: {{ post.userName || "匿名用户" }}</span>
              </div>
            </template>
          </a-list-item-meta>
          <img
            v-if="post.imageUrl"
            :src="getImageUrl(post.imageUrl)"
            alt="Post Image"
            class="post-image"
            @click="openPostDetail(post.id)"
          />

          <!-- 交互按钮区域 -->
          <div class="post-actions">
            <a-button
              type="text"
              :class="{ liked: post.isLiked }"
              @click="handleLike(post)"
            >
              <template #icon><like-outlined /></template>
              {{ post.starsCount || 0 }}
            </a-button>

            <a-button type="text" @click="openPostDetail(post.id, 'comment')">
              <template #icon><comment-outlined /></template>
              {{ post.commentsCount || 0 }}
            </a-button>

            <a-button type="text" @click="handleShare(post)">
              <template #icon><share-alt-outlined /></template>
              分享
            </a-button>
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

    <!-- 帖子详情抽屉 -->
    <a-drawer
      :visible="drawerVisible"
      :title="currentPost?.title || '帖子详情'"
      placement="right"
      width="70%"
      @close="closeDrawer"
    >
      <template v-if="currentPost">
        <div class="post-detail-header">
          <a-avatar :size="40" :src="currentPost.userAvatar">
            {{ currentPost.userName?.[0] || "U" }}
          </a-avatar>
          <div class="post-detail-user">
            <div class="post-detail-username">
              {{ currentPost.userName || "匿名用户" }}
            </div>
            <div class="post-detail-time">
              {{ formatDate(currentPost.createdAt) }}
            </div>
          </div>
          <a-tag :color="getStatusColor(currentPost.status)">
            {{ getStatusText(currentPost.status) }}
          </a-tag>
        </div>

        <div class="post-detail-content">
          <p>{{ currentPost.content }}</p>
          <img
            v-if="currentPost.imageUrl"
            :src="getImageUrl(currentPost.imageUrl)"
            alt="Post Image"
            class="post-detail-image"
          />
        </div>

        <div class="post-detail-actions">
          <a-button
            :type="currentPost.isLiked ? 'primary' : 'default'"
            @click="handleLike(currentPost)"
          >
            <template #icon><like-outlined /></template>
            {{ currentPost.isLiked ? "已点赞" : "点赞" }} ({{
              currentPost.starsCount || 0
            }})
          </a-button>

          <a-button @click="focusCommentInput">
            <template #icon><comment-outlined /></template>
            评论 ({{ currentPost.commentsCount || 0 }})
          </a-button>

          <a-button @click="handleShare(currentPost)">
            <template #icon><share-alt-outlined /></template>
            分享
          </a-button>
        </div>

        <!-- 评论区 -->
        <a-divider orientation="left">评论区</a-divider>

        <div class="comment-input">
          <a-textarea
            ref="commentInputRef"
            v-model:value="commentContent"
            :placeholder="'说点什么..'"
            :auto-size="{ minRows: 2, maxRows: 6 }"
          />
          <a-button
            type="primary"
            :disabled="!commentContent.trim()"
            @click="submitComment"
            class="comment-submit"
          >
            发布
          </a-button>
        </div>

        <a-list
          class="comment-list"
          :loading="commentsLoading"
          item-layout="horizontal"
          :data-source="comments"
        >
          <template #header>{{
            comments.length > 0 ? `${comments.length} 条评论` : "暂无评论"
          }}</template>
          <template #renderItem="{ item }">
            <a-list-item>
              <a-comment
                :author="item.userName || '匿名用户'"
                :avatar="item.userAvatar"
                :content="item.content"
                :datetime="formatDate(item.createdAt)"
              >
                <template #actions>
                  <span @click="replyToComment(item)">回复</span>
                </template>
              </a-comment>
            </a-list-item>
          </template>
        </a-list>
      </template>
    </a-drawer>
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { message } from "ant-design-vue";
import {
  LikeOutlined,
  CommentOutlined,
  ShareAltOutlined,
} from "@ant-design/icons-vue";
import { Post } from "../../types/post";

const route = useRoute();
const router = useRouter();

const posts = ref<Post[]>([]);
const total = ref(0);
const pageSize = ref(5);
const currentPage = ref(1);
const loading = ref(false);

// 抽屉相关
const drawerVisible = ref(false);
const currentPost = ref<Post | null>(null);
const commentsLoading = ref(false);
const comments = ref<any[]>([]);
const commentContent = ref("");
const commentInputRef = ref(null);

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

// 截断内容
const truncateContent = (content: string) => {
  if (!content) return "";
  return content.length > 100 ? content.substring(0, 100) + "..." : content;
};

// 判断内容是否被截断
const isContentTruncated = (content: string) => {
  return content && content.length > 100;
};

// 获取帖子列表
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

// 打开帖子详情抽屉
const openPostDetail = async (postId: number, action?: string) => {
  try {
    const response = await axios.get(`/api/post/GetPostById/${postId}`);
    currentPost.value = response.data;
    drawerVisible.value = true;

    // 加载评论
    fetchComments(postId);

    // 如果指定了action是评论，则聚焦到评论输入框
    if (action === "comment") {
      setTimeout(() => {
        focusCommentInput();
      }, 300);
    }
  } catch (error) {
    console.error("获取帖子详情失败:", error);
    message.error("获取帖子详情失败，请稍后重试");
  }
};

// 关闭抽屉
const closeDrawer = () => {
  drawerVisible.value = false;
  currentPost.value = null;
  comments.value = [];
  commentContent.value = "";
};

// 加载评论
const fetchComments = async (postId: number) => {
  commentsLoading.value = true;
  try {
    const response = await axios.get(
      `/api/comment/GetCommentsByPostId/${postId}`,
    );
    comments.value = response.data;
  } catch (error) {
    console.error("获取评论失败:", error);
    message.error("获取评论失败，请稍后重试");
  } finally {
    commentsLoading.value = false;
  }
};

// 处理点赞
const handleLike = async (post: Post) => {
  try {
    // 这里根据你的后端API调整
    await axios.post(`/api/post/LikePost/${post.id}`);

    // 乐观更新UI
    if (!post.isLiked) {
      post.starsCount = (post.starsCount || 0) + 1;
      post.isLiked = true;
      message.success("点赞成功");
    } else {
      post.starsCount = Math.max((post.starsCount || 1) - 1, 0);
      post.isLiked = false;
      message.success("已取消点赞");
    }

    // 如果点赞的是当前详情页的帖子，同步更新
    if (currentPost.value && currentPost.value.id === post.id) {
      currentPost.value.starsCount = post.starsCount;
      currentPost.value.isLiked = post.isLiked;
    }
  } catch (error) {
    console.error("点赞操作失败:", error);
    message.error("点赞操作失败，请稍后重试");
  }
};

// 处理分享
const handleShare = (post: Post) => {
  // 复制链接到剪贴板
  const url = `${window.location.origin}/forum/post/${post.id}`;
  navigator.clipboard
    .writeText(url)
    .then(() => {
      message.success("链接已复制到剪贴板，快去分享吧！");
    })
    .catch(() => {
      message.error("复制链接失败");
    });
};

// 聚焦评论输入框
const focusCommentInput = () => {
  if (commentInputRef.value) {
    setTimeout(() => {
      (commentInputRef.value as any)?.focus();
    }, 100);
  }
};

// 提交评论
const submitComment = async () => {
  if (!commentContent.value.trim() || !currentPost.value) return;

  try {
    // 根据你的API调整
    await axios.post("/api/comment/AddComment", {
      postId: currentPost.value.id,
      content: commentContent.value,
    });

    message.success("评论发布成功");
    commentContent.value = "";

    // 重新加载评论
    await fetchComments(currentPost.value.id);

    // 更新帖子的评论数
    if (currentPost.value) {
      currentPost.value.commentsCount =
        (currentPost.value.commentsCount || 0) + 1;

      // 同步更新列表中的帖子评论数
      const postInList = posts.value.find(
        (p) => p.id === currentPost.value?.id,
      );
      if (postInList) {
        postInList.commentsCount = currentPost.value.commentsCount;
      }
    }
  } catch (error) {
    console.error("发布评论失败:", error);
    message.error("发布评论失败，请稍后重试");
  }
};

// 回复评论
const replyToComment = (comment: any) => {
  commentContent.value = `@${comment.userName || "用户"} `;
  focusCommentInput();
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
</script>

<style scoped>
.post-image {
  max-width: 200px;
  max-height: 200px;
  object-fit: cover;
  margin-top: 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.post-image:hover {
  opacity: 0.9;
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

.post-title {
  cursor: pointer;
  transition: color 0.3s;
}

.post-title:hover {
  color: #1890ff;
}

.post-content {
  cursor: pointer;
  transition: color 0.3s;
}

.post-content:hover {
  color: #555;
}

.post-actions {
  display: flex;
  margin-top: 16px;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.post-actions .ant-btn {
  flex: 1;
  text-align: center;
  padding: 6px 0;
}

.post-actions .ant-btn.liked {
  color: #1890ff;
}

/* 详情抽屉样式 */
.post-detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.post-detail-user {
  margin-left: 12px;
  flex: 1;
}

.post-detail-username {
  font-weight: bold;
  font-size: 16px;
}

.post-detail-time {
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}

.post-detail-content {
  margin: 16px 0;
  font-size: 16px;
  line-height: 1.6;
}

.post-detail-image {
  max-width: 100%;
  border-radius: 8px;
  margin: 16px 0;
}

.post-detail-actions {
  display: flex;
  margin: 20px 0;
  justify-content: space-around;
}

.comment-input {
  margin: 24px 0;
  position: relative;
}

.comment-submit {
  position: absolute;
  bottom: 8px;
  right: 8px;
}

.comment-list {
  margin-top: 24px;
}
</style>
