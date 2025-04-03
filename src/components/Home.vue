<template>
  <div class="home-container">
    <!-- 轮播图部分 -->
    <div class="carousel-section">
      <el-carousel height="400px" :interval="5000" arrow="hover">
        <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
          <div
            class="carousel-content"
            :style="{ backgroundImage: `url(${item.image})` }"
          >
            <div class="carousel-overlay">
              <h2>{{ item.title }}</h2>
              <p>{{ item.description }}</p>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 数据概览卡片 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="6" v-for="(stat, index) in statistics" :key="index">
          <el-card class="stat-card" :body-style="{ padding: '20px' }">
            <div class="stat-icon">
              <i :class="stat.icon"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 现有的活动部分 -->
    <section class="activity-section">
      <div class="section-header">
        <h2><i class="icon-fire"></i> 火热进行中的活动</h2>
        <el-button type="primary" text
          >查看更多 <el-icon><ArrowRight /></el-icon
        ></el-button>
      </div>

      <el-row :gutter="20">
        <el-col :span="8" v-for="(activity, index) in activities" :key="index">
          <el-card class="activity-card" :body-style="{ padding: '0px' }">
            <div
              class="activity-image"
              :style="{ backgroundImage: `url(${activity.image})` }"
            >
              <div
                class="activity-tag"
                :style="{ backgroundColor: activity.tagColor }"
              >
                {{ activity.tag }}
              </div>
            </div>
            <div class="activity-content">
              <h3>{{ activity.title }}</h3>
              <p>{{ activity.description }}</p>
              <div class="activity-footer">
                <span class="activity-time">
                  <el-icon><Calendar /></el-icon>
                  {{ activity.time }}
                </span>
                <span class="activity-location">
                  <el-icon><Location /></el-icon>
                  {{ activity.location }}
                </span>
              </div>
              <el-button type="primary" class="join-button">立即参与</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <!-- 通知公告部分 -->
    <section class="notice-section">
      <div class="section-header">
        <h2><i class="icon-megaphone"></i> 学校最新通知</h2>
        <el-button type="primary" text
          >历史通知 <el-icon><ArrowRight /></el-icon
        ></el-button>
      </div>

      <el-timeline>
        <el-timeline-item
          v-for="(notice, index) in notices"
          :key="index"
          :timestamp="notice.date"
          placement="top"
          :type="index === 0 ? 'primary' : ''"
        >
          <el-card>
            <h4>{{ notice.title }}</h4>
            <p>{{ notice.content }}</p>
            <el-button type="primary" link>
              查看详情
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Calendar, Location, ArrowRight } from "@element-plus/icons-vue";

const carouselItems = ref([
  {
    image: new URL("../assets/img/school.jpg", import.meta.url).href,
    title: "2025年春季校园文化节",
    description: "展现青春风采，绽放多彩人生",
  },
  {
    image: new URL("../assets/img/contest.png", import.meta.url).href,
    title: "第十届创新创业大赛",
    description: "让梦想起航，让创意闪耀",
  },
  {
    image: new URL("../assets/img/R-C.jpg", import.meta.url).href,
    title: "国际文化交流周",
    description: "开放包容，互学互鉴",
  },
]);

const statistics = ref([
  { icon: "el-icon-user", value: "1,234", label: "参与学生" },
  { icon: "el-icon-star", value: "56", label: "进行中活动" },
  { icon: "el-icon-timer", value: "2,345", label: "志愿服务时长" },
  { icon: "el-icon-medal", value: "89", label: "获奖项目" },
]);

const activities = ref([
  {
    image: new URL("../assets/img/chuangye.png", import.meta.url).href,
    title: "创新创业工作坊",
    description: "为期两天的创业培训，邀请业界专家分享经验",
    tag: "创业指导",
    tagColor: "#409EFF",
    time: "2025-04-15",
    location: "创新创业中心",
  },
  {
    image: new URL("../assets/img/shuhua.jpg", import.meta.url).href,
    title: "校园书画展",
    description: "展示优秀学生书画作品，弘扬传统文化",
    tag: "文化艺术",
    tagColor: "#67C23A",
    time: "2025-04-20",
    location: "图书馆展厅",
  },
  {
    image: new URL("../assets/img/zhiyuan.png", import.meta.url).href,
    title: "志愿服务日",
    description: "组织学生参与社区服务，传递温暖与关爱",
    tag: "志愿服务",
    tagColor: "#E6A23C",
    time: "2025-04-25",
    location: "各社区服务点",
  },
]);

const notices = ref([
  {
    date: "2025-04-10",
    title: "关于2024年春季运动会的通知",
    content: "定于4月20日举行春季运动会，请各院系做好参赛准备工作。",
  },
  {
    date: "2025-04-08",
    title: "图书馆开放时间调整通知",
    content: "自4月15日起，图书馆开放时间调整为8:00-22:00。",
  },
  {
    date: "2025-04-05",
    title: "2024届毕业生学位申请通知",
    content: "请各位毕业生于4月30日前完成学位申请材料提交。",
  },
  {
    date: "2025-04-01",
    title: "五一劳动节放假安排",
    content: "五一劳动节放假时间为5月1日至5月5日，5月6日正常上课。",
  },
]);
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.carousel-section {
  margin-bottom: 40px;
}

.carousel-content {
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
}

.carousel-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
}

.carousel-overlay h2 {
  font-size: 32px;
  margin-bottom: 10px;
}

.stats-section {
  margin-bottom: 40px;
}

.stat-card {
  text-align: center;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-color-primary);
}

.stat-label {
  color: var(--el-text-color-secondary);
  margin-top: 8px;
}

.activity-card {
  height: 100%;
  transition: transform 0.3s;
}

.activity-card:hover {
  transform: translateY(-5px);
}

.activity-image {
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.activity-tag {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 4px 12px;
  border-radius: 4px;
  color: white;
}

.activity-content {
  padding: 20px;
}

.activity-footer {
  display: flex;
  justify-content: space-between;
  margin: 16px 0;
  color: var(--el-text-color-secondary);
}

.join-button {
  width: 100%;
}

.notice-section {
  margin-top: 40px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .el-col {
    width: 100%;
    margin-bottom: 20px;
  }
}
</style>
