<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";

// 学生数据状态
const studentData = ref(null);
const activityList = ref([]);
const totalScore = ref(0);
const loading = ref(true);
const error = ref(null);

// 使用数组来存储多个激活的类别
const activeCategories = ref([]);

// 分类数据映射
const categoryMap = {
  deyu: { name: "德育", title: "德育（35分）", total: 35 },
  zhiyu: { name: "智育", title: "智育（35分）", total: 35 },
  tiyu: { name: "体育", title: "体育（10分）", total: 10 },
  meiyu: { name: "美育", title: "美育（10分）", total: 10 },
  jiating: { name: "家庭", title: "家庭劳动（10分）", total: 10 },
  qingshi: { name: "寝室", title: "寝室劳动（15分）", total: 15 },
  xiaoyuan: { name: "校园", title: "校园劳动（50分）", total: 50 },
  xiangtu: { name: "乡土", title: "乡土劳动（15分）", total: 15 },
  chanxue: { name: "产学", title: "产学劳动（10分）", total: 10 },
  volunteer_time: { name: "志愿", title: "志愿时长", total: 10 },
};

// 存储处理后的分类数据
const categories = ref([]);

// 获取学生数据
const fetchStudentData = async () => {
  loading.value = true;
  error.value = null;

  try {
    // 使用当前登录用户ID或固定ID进行测试
    const userId = 12; // 这里应替换为实际的用户ID获取方式
    const response = await axios.get(`/api/student/lookfor?user_id=${userId}`);

    // 新的响应格式处理
    studentData.value = response.data.student;
    activityList.value = response.data.sutuoList || [];

    // 处理数据并计算总分
    processStudentData();
  } catch (err) {
    console.error("获取学生数据失败:", err);
    error.value = err.message || "获取数据失败";
  } finally {
    loading.value = false;
  }
};

// 处理学生数据
const processStudentData = () => {
  if (!studentData.value) return;

  const data = studentData.value;
  let sum = 0;
  const processedCategories = [];

  // 处理每个分类
  Object.entries(categoryMap).forEach(([key, config]) => {
    const score = data[key] || 0;

    // 累加总分（除志愿时长外）
    if (key !== "volunteer_time") {
      sum += score;
    }

    // 从活动列表中筛选出该类别有分数>0的活动
    const categoryActivities = activityList.value
      .filter((activity) => activity[key] > 0)
      .map((activity) => ({
        date: activity.activity.split('"')[0] || "", // 从活动名提取日期
        name: activity.activity.replace(/^\d{4}\.\d{1,2}\.\d{1,2}/, "").trim(), // 去掉日期保留名称
        score: activity[key],
      }));

    // 构建分类对象
    processedCategories.push({
      name: config.name,
      title: config.title,
      score: score,
      total: config.total,
      activities: categoryActivities,
    });
  });

  // 更新状态
  totalScore.value = sum;
  categories.value = processedCategories;
};

// 计算分类的行索引
const getCategoryRow = (index) => Math.floor(index / 2);

// 获取同一行的分类
const getSameRowCategories = (categoryName) => {
  const index = categories.value.findIndex((c) => c.name === categoryName);
  if (index === -1) return [];

  const rowIndex = getCategoryRow(index);
  const startIndex = rowIndex * 2;
  const endIndex = Math.min(startIndex + 1, categories.value.length - 1);

  return categories.value.slice(startIndex, endIndex + 1).map((c) => c.name);
};

// 切换活动列表的显示状态
const toggleActivities = (category) => {
  const sameRowCategories = getSameRowCategories(category);

  if (activeCategories.value.includes(category)) {
    activeCategories.value = activeCategories.value.filter(
      (cat) => !sameRowCategories.includes(cat),
    );
  } else {
    const newActiveCategories = [...activeCategories.value];
    sameRowCategories.forEach((cat) => {
      if (!newActiveCategories.includes(cat)) {
        newActiveCategories.push(cat);
      }
    });
    activeCategories.value = newActiveCategories;
  }
};

// 计算百分比
const calculatePercentage = (score, total) => {
  return Math.min((score / total) * 100, 100);
};

// 判断是否为劳动类别
const isLaborCategory = (name) => {
  return ["家庭", "寝室", "校园", "乡土", "产学"].includes(name);
};

// 组件加载时获取数据
onMounted(fetchStudentData);
</script>

<template>
  <div class="score-container">
    <!-- 加载中状态 -->
    <a-spin :spinning="loading">
      <!-- 错误提示 -->
      <a-alert v-if="error" type="error" :message="error" banner />

      <!-- 素拓分模块 -->
      <a-card class="total-section" :bordered="false" v-if="!loading && !error">
        <h2>我的素拓分详情</h2>
        <div class="total-score">{{ totalScore }}</div>
        <div class="total-full">满分100分</div>
        <a-progress
          :percent="calculatePercentage(totalScore, 100)"
          :stroke-color="{
            '0%': '#108ee9',
            '100%': '#87d068',
          }"
          :stroke-width="12"
        />
      </a-card>

      <div class="category-grid" v-if="!loading && !error">
        <!-- 动态渲染所有分类卡片 -->
        <a-card
          v-for="(category, index) in categories"
          :key="category.name"
          class="score-card"
          :bordered="false"
          :body-style="{ padding: '16px', position: 'relative' }"
        >
          <div class="score-title" @click="toggleActivities(category.name)">
            {{ category.title }}
            <down-outlined
              :rotate="activeCategories.includes(category.name) ? 180 : 0"
              class="toggle-icon"
            />
          </div>
          <a-progress
            :percent="calculatePercentage(category.score, category.total)"
            :stroke-color="
              isLaborCategory(category.name)
                ? { '0%': '#ff6b35', '100%': '#ff9e6a' }
                : { '0%': '#6197ed', '100%': '#6ea1ff' }
            "
            :show-info="false"
            :stroke-width="8"
          />
          <div class="score-detail">
            <span>{{
              category.name === "志愿" ? "当前时长" : "当前得分"
            }}</span>
            <span>{{
              category.name === "志愿"
                ? category.score + "/h"
                : category.score + "/" + category.total
            }}</span>
          </div>

          <a-collapse :bordered="false" :activeKey="activeCategories">
            <a-collapse-panel
              :key="category.name"
              :show-arrow="false"
              class="activity-collapse"
            >
              <div class="activity-list-container">
                <div
                  v-if="category.activities.length === 0"
                  class="empty-activities"
                >
                  暂无活动记录
                </div>
                <div
                  class="activity-item"
                  v-for="(activity, idx) in category.activities"
                  :key="idx"
                >
                  <span class="activity-info">
                    {{ activity.date }} {{ activity.name }}
                  </span>
                  <span class="activity-score">
                    {{ activity.score
                    }}{{ category.name === "志愿" ? "h" : "分" }}
                  </span>
                </div>
              </div>
            </a-collapse-panel>
          </a-collapse>
        </a-card>
      </div>
    </a-spin>
  </div>
</template>
<style scoped>
:root {
  --primary-blue: #6197ed; /* 主蓝 */
  --primary-orange: #ff6b35; /* 主橙 */
  --light-bg: #f0f4f8;
  --card-radius: 12px;
}

.score-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f0f4f8;
  min-height: calc(100vh - 64px - 16px);
}

/* 总分展示模块 */
.total-section {
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  border-radius: 12px !important;
}

.total-score {
  font-size: 3.5rem;
  color: #6197ed;
  font-weight: bold;
  margin: 1rem 0;
}

.total-full {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

/* 分类模块容器 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin: 2rem 0;
}

@media (max-width: 768px) {
  .category-grid {
    grid-template-columns: 1fr;
  }
}

/* 单项评分模块 */
.score-card {
  border-radius: 12px !important;
  margin-bottom: 20px;
}

.score-title {
  color: #333;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  cursor: pointer;
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-icon {
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.score-detail {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  color: #666;
}

/* 活动列表样式 */
.activity-collapse {
  background: transparent;
  border: none;
}

.activity-list-container {
  padding: 0.5rem 0;
}

.activity-item {
  padding: 0.6rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-info {
  font-size: 14px;
  color: #333;
}

.activity-score {
  font-size: 14px;
  color: #1890ff;
  font-weight: 500;
}

.empty-activities {
  text-align: center;
  padding: 20px 0;
  color: #999;
}

:deep(.ant-collapse-content) {
  background-color: #f9f9f9;
}

:deep(.ant-collapse-header) {
  display: none;
}

:deep(.ant-collapse-content-box) {
  padding: 0 !important;
}
</style>
