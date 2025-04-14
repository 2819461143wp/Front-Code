<template>
  <div class="analysis-container">
    <!-- 顶部概览 -->
    <el-row :gutter="20" class="overview-section">
      <el-col :span="6" v-for="(item, index) in overviewCards" :key="index">
        <div class="modern-card" :class="[`accent-${index + 1}`]">
          <div class="card-header">
            <el-icon class="card-icon"><component :is="item.icon" /></el-icon>
            <span class="card-title">{{ item.title }}</span>
          </div>
          <div class="card-value">
            {{ item.value }}
            <span class="card-unit">{{ item.unit }}</span>
          </div>
          <div class="card-divider"></div>
          <div class="card-footer">
            <span class="compare-text">
              <el-icon
                :style="{ color: item.trend > 0 ? '#52c41a' : '#ff4d4f' }"
              >
                <CaretTop v-if="item.trend > 0" />
                <CaretBottom v-else />
              </el-icon>
              {{ Math.abs(item.trend) }}%
            </span>
            <span class="update-time">最近更新：{{ item.time }}</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 核心数据区 -->
    <el-row :gutter="20" class="mb-4">
      <!-- 素拓分雷达图 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><PieChart /></el-icon>
              <span>素拓分维度分析</span>
            </div>
          </template>
          <div ref="sutuoRadarRef" style="height: 400px"></div>
        </el-card>
      </el-col>

      <!-- 劳动分雷达图 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><PieChart /></el-icon>
              <span>劳动分维度分析</span>
            </div>
          </template>
          <div ref="laborRadarRef" style="height: 400px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 趋势图 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><DataLine /></el-icon>
              <span>志愿时长趋势</span>
            </div>
          </template>
          <div ref="lineChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 排行榜 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="ranking-card">
          <template #header>
            <div class="card-header">
              <el-icon><Trophy /></el-icon>
              <span>素拓分排行榜</span>
            </div>
          </template>
          <el-table :data="scoreRankings" stripe class="ranking-table">
            <el-table-column prop="student_name" label="姓名" width="120" />
            <el-table-column prop="student_id" label="学号" />
            <el-table-column prop="total_score" label="总分" width="100">
              <template #default="{ row }">
                <el-tag type="warning">{{ row.total_score }} 分</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="ranking-card">
          <template #header>
            <div class="card-header">
              <el-icon><Clock /></el-icon>
              <span>志愿时长排行榜</span>
            </div>
          </template>
          <el-table :data="volunteerRankings" stripe class="ranking-table">
            <el-table-column prop="student_name" label="姓名" width="120" />
            <el-table-column prop="student_id" label="学号" />
            <el-table-column prop="total_time" label="总时长" width="120">
              <template #default="{ row }">
                <el-tag type="success">{{ row.total_time }} 小时</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as echarts from "echarts";
import axios from "axios";
import {
  User,
  List,
  TrendCharts,
  PieChart,
  DataLine,
  Trophy,
  Clock,
  CaretTop,
  CaretBottom,
} from "@element-plus/icons-vue";

// 图表引用
const lineChartRef = ref(null);
const sutuoRadarRef = ref(null);
const laborRadarRef = ref(null);
let lineChart = null;
let sutuoRadarChart = null;
let laborRadarChart = null;

// 中文维度映射
const dimensionChineseMap = {
  meiyu: "美育",
  deyu: "德育",
  tiyu: "体育",
  zhiyu: "智育",
  xiaoyuan: "校园",
  xiangtu: "乡土",
  qingshi: "情系",
  jiating: "家庭",
  chanxue: "产学",
};

// 响应式数据
const scoreRankings = ref([]);
const volunteerRankings = ref([]);
const dimensions = ref({});
const volunteerTrend = ref([]);

// 概览卡片配置
const overviewCards = ref([
  {
    title: "总志愿时长",
    value: 0,
    unit: "小时",
    icon: TrendCharts,
    trend: 0,
    time: "今日",
  },
  {
    title: "参与学生数",
    value: 0,
    unit: "人",
    icon: User,
    trend: 0,
    time: "今日",
  },
  {
    title: "平均素拓分",
    value: 0,
    unit: "分",
    icon: List,
    trend: 0,
    time: "今日",
  },
  {
    title: "活动月份数",
    value: 0,
    unit: "个月",
    icon: List,
    trend: 0,
    time: "今日",
  },
]);

// 初始化素拓分雷达图
const initSutuoRadar = () => {
  const categories = ["deyu", "zhiyu", "meiyu", "tiyu"];
  const data = categories.map((key) => dimensions.value[key]?.average || 0);

  const option = {
    radar: {
      indicator: categories.map((key) => ({
        name: dimensionChineseMap[key],
        max: Math.max(dimensions.value[key]?.average * 1.5 || 5, 3),
      })),
      shape: "circle",
      axisLine: { lineStyle: { color: "#36D1DC" } },
    },
    series: [
      {
        type: "radar",
        data: [{ value: data }],
        areaStyle: { color: "rgba(54,209,220,0.3)" },
        lineStyle: { color: "#36D1DC", width: 2 },
        label: { show: true, formatter: (params) => params.value.toFixed(2) },
      },
    ],
  };
  sutuoRadarChart.setOption(option);
};

// 初始化劳动分雷达图
const initLaborRadar = () => {
  const categories = ["xiaoyuan", "xiangtu", "qingshi", "jiating", "chanxue"];
  const data = categories.map((key) => dimensions.value[key]?.average || 0);

  const option = {
    radar: {
      indicator: categories.map((key) => ({
        name: dimensionChineseMap[key],
        max: Math.max(dimensions.value[key]?.average * 1.5 || 5, 3),
      })),
      shape: "circle",
      axisLine: { lineStyle: { color: "#A8E063" } },
    },
    series: [
      {
        type: "radar",
        data: [{ value: data }],
        areaStyle: { color: "rgba(168,224,99,0.3)" },
        lineStyle: { color: "#A8E063", width: 2 },
        label: { show: true, formatter: (params) => params.value.toFixed(2) },
      },
    ],
  };
  laborRadarChart.setOption(option);
};

// 初始化折线图
const initLineChart = () => {
  const option = {
    xAxis: {
      type: "category",
      data: volunteerTrend.value.map((v) => v.month),
      axisLine: { lineStyle: { color: "#999" } },
    },
    yAxis: { type: "value" },
    series: [
      {
        data: volunteerTrend.value.map((v) => v.total_time),
        type: "line",
        smooth: true,
        areaStyle: { color: "rgba(255,154,158,0.2)" },
        lineStyle: { color: "#FF9A9E", width: 2 },
      },
    ],
  };
  lineChart.setOption(option);
};

// 获取数据
const fetchData = async () => {
  try {
    const { data } = await axios.get("/api/sutuo/analysis");

    // 绑定数据
    scoreRankings.value = data.scoreRankings;
    volunteerRankings.value = data.volunteerRankings;
    dimensions.value = data.dimensions;
    volunteerTrend.value = data.volunteerTrend;

    // 更新概览卡片
    overviewCards.value[0].value = data.overview.total_volunteer_time.value;
    overviewCards.value[1].value = data.overview.total_students.value;
    overviewCards.value[2].value = data.averageScore.toFixed(1);
    overviewCards.value[3].value = data.volunteerTrend.length;

    // 初始化图表
    lineChart = echarts.init(lineChartRef.value);
    sutuoRadarChart = echarts.init(sutuoRadarRef.value);
    laborRadarChart = echarts.init(laborRadarRef.value);
    initLineChart();
    initSutuoRadar();
    initLaborRadar();
  } catch (error) {
    console.error("数据获取失败:", error);
  }
};

onMounted(() => {
  fetchData();
  window.addEventListener("resize", () => {
    lineChart?.resize();
    sutuoRadarChart?.resize();
    laborRadarChart?.resize();
  });
});
</script>

<style scoped>
.analysis-container {
  padding: 20px;
  background: #f8fafc;
  min-height: 100vh;
}

.modern-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s;
  position: relative;
  overflow: hidden;
}

.modern-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.modern-card::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
}

.accent-1::before {
  background: #36d1dc;
}
.accent-2::before {
  background: #ff9a9e;
}
.accent-3::before {
  background: #a8e063;
}
.accent-4::before {
  background: #ffb347;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.card-icon {
  font-size: 24px;
  color: #666;
  margin-right: 12px;
}

.card-title {
  font-size: 15px;
  color: #666;
  letter-spacing: 0.5px;
}

.card-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
}

.card-unit {
  font-size: 14px;
  color: #999;
  margin-left: 6px;
}

.card-divider {
  height: 1px;
  background: #eee;
  margin: 20px 0;
}

.chart-card {
  border-radius: 12px;
  margin-bottom: 20px;
  transition: box-shadow 0.3s;
}

.chart-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.ranking-card {
  border-radius: 12px;
  height: 100%;
}

.ranking-table :deep(.el-table__row) td {
  padding: 12px 0;
}

.ranking-table :deep(.el-tag) {
  font-weight: bold;
  border: none;
  padding: 8px 12px;
}

.el-row {
  margin-bottom: 20px;
}
</style>
