<template>
  <div class="all">
    <!-- 背景图 -->
    <div>
      <img class="one" src="../../assets/beijing.png" />
    </div>

    <div class="container">
      <!-- 头像和名字部分 -->
      <div class="image-container">
        <!-- 动态加载头像 -->
        <img
          :src="
            character?.avatar_url
              ? '/' + character.avatar_url
              : '../assets/1.png'
          "
          alt="头像"
        />
      </div>
      <div class="text-container">
        <p>{{ character?.name || "加载中..." }}</p>
        <div class="info-container">
          <span class="info-item"
            >粉丝数：{{ character?.fans_count ?? "加载中..." }}</span
          >
          <span class="info-item"
            >关注数：{{ character?.follow_count ?? "加载中..." }}</span
          >
        </div>
        <p>{{ character?.biography ?? "简介" }}</p>
      </div>
    </div>

    <!-- 友情链接部分 -->
    <div class="link-container">
      <a href="#">帖子</a>
      <a href="#">收藏</a>
      <a href="#">点赞</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"; // 引入 ref 和 onMounted 钩子
import axios from "axios"; // 引入 axios
import { store } from "../../store"; // 引入 store
import { Character } from "../../type/character.ts";
import { message } from "ant-design-vue"; // 引入接口

// 定义响应式变量，用于存储后端请求的数据
const character = ref<Character | null>(null);

// 请求数据的函数
const fetchCharacter = async () => {
  try {
    // 发起 GET 请求
    const response = await axios.get(`/api/character/${store.userId}`);
    // 更新 character 的值
    character.value = response.data;
    console.log("character:", character.value);
    store.updateImage(character.value?.avatar_url ?? "");
  } catch (error) {
    message.error("网络连接不稳定，请稍后再试:");
  }
};

// 在组件挂载后调用请求函数
onMounted(fetchCharacter);
</script>

<style scoped>
/* 背景图 */
.one {
  width: 100%;
  height: 300px;
  object-fit: cover; /* 图片适应容器大小 */
  opacity: 0.6; /* 默认透明度 */
  transition: opacity 0.3s ease;
}

.one:hover {
  opacity: 1; /* 鼠标悬停时透明度为100% */
}

/* 主容器 */
.container {
  display: flex;
  flex-wrap: wrap; /* 支持换行 */
  align-items: center;
  padding: 20px;
  gap: 20px; /* 图片和文字之间的间距 */
}

.image-container {
  flex-shrink: 0; /* 防止图片缩小 */
  width: 80px;
  height: 80px;
  border-radius: 50%;
}

.image-container img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover; /* 确保头像为圆形 */
}

.text-container {
  flex-grow: 1; /* 文字部分自适应剩余空间 */
  padding: 10px;
  max-width: 500px; /* 限制文字部分最大宽度 */
}

.text-container p {
  margin: 10px 0;
  font-size: 1.2rem; /* 文字大小 */
}

.info-container {
  display: flex;
  gap: 15px; /* 间距 */
  margin-bottom: 10px;
}

.info-item {
  font-size: 1rem;
  color: #666;
}

/* 友情链接容器 */
.link-container {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding: 10px;
  border-top: 1px solid #ccc;
}

.link-container a {
  text-decoration: none;
  color: #333;
  padding: 10px 20px;
  transition: background-color 0.3s;
}

.link-container a:hover {
  background-color: #ddd;
}

/* 响应式布局：小屏幕下调整为垂直排列 */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
    align-items: flex-start; /* 左对齐 */
  }

  .image-container {
    margin-bottom: 15px;
  }

  .text-container {
    max-width: 100%; /* 限制为100%宽度 */
  }

  .link-container {
    flex-direction: column;
    align-items: flex-start; /* 垂直排列 */
    gap: 10px; /* 间距 */
  }

  .link-container a {
    width: 100%; /* 链接宽度100% */
    text-align: left; /* 左对齐 */
  }
}

/* 响应式布局：极小屏幕下调整布局 */
@media (max-width: 480px) {
  .container {
    padding: 10px;
  }

  .text-container p {
    font-size: 1rem; /* 字体调整为适合小屏幕 */
  }

  .info-container {
    flex-direction: column;
    gap: 10px; /* 在小屏幕上，信息垂直排列 */
  }

  .info-item {
    font-size: 0.9rem; /* 调整文字大小 */
  }
}
</style>
