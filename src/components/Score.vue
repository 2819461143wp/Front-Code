<template>
  <div class="score-container">
    <a-spin :spinning="loading">
      <a-alert v-if="error" type="error" :message="error" banner />
      <div class="layout-container">
        <!-- 左侧个人信息 -->
        <div class="left-side">
          <div class="personal-info" v-if="!loading && !error && studentData">
            <a-card :bordered="false" class="info-card">
              <div class="info-header">
                <h2>个人信息</h2>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">学号：</span>
                  <span class="info-value">{{ studentData.id }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">姓名：</span>
                  <span class="info-value">{{ studentData.studentName }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">学院：</span>
                  <span class="info-value">{{ studentData.academy }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">班级：</span>
                  <span class="info-value">{{ studentData.className }}</span>
                </div>
              </div>
            </a-card>
          </div>
        </div>

        <!-- 右侧提示或反馈 -->
        <div class="right-side">
          <a-card :bordered="false" class="tips-card">
            <h2>提示与反馈</h2>
            <div class="tips-content">
              <p>如果您对评分有任何疑问，请联系辅导员或教务处。</p>
              <p>反馈邮箱：feedback@school.com</p>
              <p>联系电话：123-456-7890</p>
            </div>
          </a-card>
        </div>
      </div>

      <!-- 总分显示区域 -->
      <div class="scores-overview" v-if="!loading && !error">
        <a-card class="score-section total-score-card" :bordered="false">
          <h2>总评分</h2>
          <div class="combined-score">{{ combinedScore }}</div>
          <div class="score-label">满分100分</div>
          <a-progress
            :percent="calculatePercentage(combinedScore, 110)"
            :stroke-color="{
              '0%': '#108ee9',
              '100%': '#87d068',
            }"
            :stroke-width="12"
          />
        </a-card>

        <div class="sub-scores">
          <a-card class="score-section" :bordered="false">
            <h3>素拓分</h3>
            <div class="score-value">{{ totalScore }}</div>
            <div class="score-label">满分90分</div>
            <a-progress
              :percent="calculatePercentage(totalScore, 100)"
              :stroke-color="{
                '0%': '#6197ed',
                '100%': '#6ea1ff',
              }"
              :stroke-width="8"
            />
          </a-card>

          <a-card class="score-section" :bordered="false">
            <h3>劳动分</h3>
            <div class="score-value">{{ laborScore }}</div>
            <div class="score-label">满分100分 (折合10分)</div>
            <a-progress
              :percent="calculatePercentage(laborScore, 100)"
              :stroke-color="{
                '0%': '#ff6b35',
                '100%': '#ff9e6a',
              }"
              :stroke-width="8"
            />
          </a-card>
        </div>
      </div>

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

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
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
  volunteerTime: { name: "志愿", title: "志愿时长", total: 10 },
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
  let sutuoSum = 0;
  const processedCategories = [];

  // 处理每个分类
  Object.entries(categoryMap).forEach(([key, config]) => {
    const score = data[key] || 0;
    const cappedScore = Math.min(score, config.total); // 限制不超过最大值

    // 累加素拓总分（只计算德育、智育、体育、美育）
    if (["deyu", "zhiyu", "tiyu", "meiyu"].includes(key)) {
      sutuoSum += cappedScore;
    }

    // 从活动列表中筛选出该类别有分数>0的活动
    const categoryActivities = activityList.value
      .filter((activity) => activity[key] > 0)
      .map((activity) => ({
        date: activity.activity.split('"')[0] || "",
        name: activity.activity.replace(/^\d{4}\.\d{1,2}\.\d{1,2}/, "").trim(),
        score: Math.min(activity[key], config.total), // 限制活动分数不超过最大值
      }));

    // 构建分类对象
    processedCategories.push({
      name: config.name,
      title: config.title,
      score: cappedScore,
      total: config.total,
      activities: categoryActivities,
    });
  });

  // 更新状态
  totalScore.value = sutuoSum;
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
  return Math.floor((score / total) * 100);
};
// 判断是否为劳动类别
const isLaborCategory = (name) => {
  return ["家庭", "寝室", "校园", "乡土", "产学"].includes(name);
};

const laborScore = computed(() => {
  if (!studentData.value) return 0;
  const data = studentData.value;

  const score =
    Math.min(data.jiating || 0, 10) +
    Math.min(data.qingshi || 0, 15) +
    Math.min(data.xiaoyuan || 0, 50) +
    Math.min(data.xiangtu || 0, 15) +
    Math.min(data.chanxue || 0, 10);
  return score.toFixed(1);
});
const combinedScore = computed(() => {
  // 劳动分100分制转换为10分制后加上素拓分
  return (totalScore.value + (laborScore.value / 100) * 10).toFixed(1);
});

// 组件加载时获取数据
onMounted(fetchStudentData);
</script>

<style scoped>
.personal-info {
  margin-bottom: 2rem;
}

.info-card {
  border-radius: 12px !important;
  background: linear-gradient(135deg, #fff 0%, #f8faff 100%);
}

.info-header {
  margin-bottom: 1rem;
}

.info-header h2 {
  color: #333;
  margin: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
}

.info-label {
  color: #666;
  margin-right: 0.5rem;
  font-size: 14px;
  min-width: 4em;
}

.info-value {
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}

.scores-overview {
  margin-bottom: 2rem;
}

.score-section {
  text-align: center;
  border-radius: 12px !important;
  height: 100%;
}

.total-score-card {
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #f6f8ff 0%, #f0f4ff 100%);
}

.sub-scores {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.combined-score {
  font-size: 3.5rem;
  font-weight: bold;
  background: linear-gradient(45deg, #6197ed, #ff6b35);
  -webkit-background-clip: text;
  color: transparent;
  margin: 1rem 0;
}

.score-value {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.score-label {
  color: #666;
  font-size: 1rem;
  margin-bottom: 1rem;
}

h2 {
  color: #333;
  margin: 0;
  padding-top: 0.5rem;
}

h3 {
  color: #333;
  margin: 0;
  padding-top: 0.5rem;
}

@media (max-width: 768px) {
  .sub-scores {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

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

/* 新增的布局样式 */
.layout-container {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.left-side {
  flex: 1;
}

.right-side {
  flex: 1;
}

.tips-card {
  border-radius: 12px !important;
  background: linear-gradient(135deg, #fff 0%, #f8faff 100%);
}

.tips-content {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}
</style>
