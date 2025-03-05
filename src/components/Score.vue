<template>
  <div class="container">
    <!-- 总分展示 -->
    <div class="total-card">
      <h2>素质拓展总分</h2>
      <div class="score">{{ totalScore }}</div>
      <div class="full-mark">满分 100 分</div>
    </div>

    <!-- 分类卡片 -->
    <div class="dashboard">
      <div
        v-for="(category, index) in categories"
        :key="category.name"
        class="category-card"
        :class="{ active: activeIndex === index }"
        @click="toggleCard(index)"
      >
        <h3>
          {{ category.name }}
          <span class="max-score">{{ category.max }}分</span>
        </h3>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: (category.score / category.max) * 100 + '%' }"
          ></div>
        </div>
        <div class="current-score">
          {{ category.score }} / {{ category.max }}
        </div>

        <!-- 细则列表 -->
        <div v-if="category.subItems" class="detail-list">
          <div class="sports-sub">
            <div
              v-for="sub in category.subItems"
              :key="sub.name"
              class="detail-item"
            >
              <span>{{ sub.name }}</span>
              <span>{{ sub.score }}/{{ sub.max }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";

// 当前激活的卡片索引
const activeIndex = ref(-1);

// 分类数据
const categories = reactive([
  {
    name: "德育",
    max: 35,
    score: 28,
  },
  {
    name: "智育",
    max: 35,
    score: 31.5,
  },
  {
    name: "美育",
    max: 10,
    score: 10,
  },
  {
    name: "体育育",
    max: 10,
    score: 5,
  },
  {
    name: "劳育",
    max: 10,
    score: 7,
    subItems: [
      { name: "家庭", max: 10, score: 2 },
      { name: "乡土", max: 15, score: 3 },
      { name: "校园", max: 50, score: 40 },
      { name: "产学", max: 10, score: 5 },
      { name: "寝室", max: 15, score: 8 },
    ],
  },
]);

// 总分计算
const totalScore = categories.reduce((sum, c) => sum + c.score, 0);

// 切换卡片状态
const toggleCard = (index) => {
  activeIndex.value = activeIndex.value === index ? -1 : index;
};
</script>

<style scoped>
/* 保持原有样式基础上添加以下修改 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.category-card {
  position: relative;
  overflow: hidden;
}

.detail-list {
  max-height: 0;
  opacity: 0;
  transition: all 0.3s ease;
  padding-top: 0;
}

.category-card.active .detail-list {
  max-height: 500px;
  opacity: 1;
  padding-top: 1rem;
}

.sports-sub {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;
}

:root {
  --primary: #2c7be5;
  --secondary: #6e84a3;
  --border: #e9ecef;
}

body {
  font-family: "Segoe UI", system-ui;
  background: #f8f9fa;
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.total-card {
  grid-column: 1 / -1;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  text-align: center;
  margin-bottom: 1rem;
}

.category-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: 0.2s;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.progress-bar {
  height: 6px;
  background: var(--border);
  border-radius: 3px;
  margin: 1rem 0;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 3px;
  transition: width 0.5s;
}

.detail-list {
  max-height: 0;
  overflow: hidden;
  transition: 0.3s ease;
  padding-left: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--border);
  font-size: 0.9em;
}

.active .detail-list {
  max-height: 500px;
  margin-top: 1rem;
}

/* 体育子项特殊处理 */
.sports-sub {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}
</style>
