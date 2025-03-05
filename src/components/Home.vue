<template>
  <div>
    <!-- 第一部分 -->
    <!-- 轮播图区域 -->
    <div class="carousel-modern">
      <div
        v-for="(slide, index) in slides"
        :key="index"
        :class="['carousel-item', { active: currentSlide === index }]"
      >
        <img :src="slide.image" :alt="slide.alt" />
        <div class="carousel-overlay">
          <h2>{{ slide.title }}</h2>
          <p>{{ slide.description }}</p>
        </div>
      </div>
    </div>
    <h1>水院要闻</h1>
    <!-- 第二部分 -->
    <!-- 主要内容区 -->
    <div class="main-content">
      <!-- 左侧内容 -->
      <div class="left-panel">
        <div class="activity-image">
          <img src="../assets/img/person.jpg" alt="活动主图" />
        </div>
        <div class="activity-content">
          <p class="head">2024年7月1日-8月31日</p>
          <p class="honor-title">喜报！我校师生获评2024年度湖州市优秀志愿者</p>
          <p class="son">
            中共湖州市委社会工作部关于2024年度湖州市志愿服务“六个十佳、百名优秀”典型名单，我校计算机学院团委副书记、院青年志愿者协会指导老师姚君毅老师，学校青年志愿者协会会长、亚运会亚残运会志愿者、电气工程学院新能源22-1班学生叶雨欣同学获评湖州市优秀志愿者。
          </p>
        </div>
      </div>
      <!-- 右侧活动列表 -->
      <div class="right-panel">
        <div class="activity-list">
          <div
            v-for="(activity, index) in activities"
            :key="index"
            class="activity-item"
          >
            <h3>{{ activity.title }}</h3>
            <p>时间：{{ activity.time }}</p>
            <p>地点：{{ activity.location }}</p>
          </div>
        </div>
      </div>
    </div>
    <!-- 第三部分 -->
    <div class="third">
      <div class="third-one" v-for="(section, index) in sections" :key="index">
        <h1>{{ section.title }}</h1>
        <div
          v-for="(item, idx) in section.items"
          :key="idx"
          class="text-block"
          @click="toggleActive(item)"
        >
          <div class="time-block">{{ item.time }}</div>
          <div class="content-block">{{ item.content }}</div>
        </div>
      </div>
    </div>
    <!-- 第四部分 -->
    <h1>综合新闻</h1>
    <div class="event-item">
      <div class="event-media">
        <img
          src="../assets/img/school.jpg"
          class="event-image"
          alt="活动相关图片"
        />
      </div>
      <div class="event-content">
        <div class="container">
          <div class="event-list">
            <div
              v-for="(event, index) in events"
              :key="index"
              class="event-item"
              @click="toggleEvent(event)"
            >
              <div class="event-header">
                <div class="event-icon">📅</div>
                <div>
                  <h3 class="event-title">{{ event.title }}</h3>
                  <span class="event-time">发布时间：{{ event.time }}</span>
                </div>
              </div>
              <div v-if="event.active" class="dropdown-content">
                <div class="detail-content">
                  <div class="tag-list">
                    <span
                      v-for="(tag, idx) in event.tags"
                      :key="idx"
                      class="tag"
                      >{{ tag }}</span
                    >
                  </div>
                  <p>{{ event.description }}</p>
                  <a href="#" class="detail-btn">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4M12 8h.01" />
                    </svg>
                    点击查看详情
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <h5>数读.水院</h5>
    <!-- 第五部分 -->
    <div class="data-wrapper">
      <div class="circle-group">
        <div
          v-for="(data, index) in dataCircles"
          :key="index"
          class="data-circle"
        >
          <div class="circle-content">
            <div class="data-icon">{{ data.icon }}</div>
            <div class="data-text">{{ data.text }}</div>
          </div>
        </div>
      </div>
    </div>
    <!-- 第七部分 -->
    <div class="footer">
      <a href="#">浙江省人民政府</a> • <a href="#">教育部</a> •
      <a href="#">工业和信息化部</a> • <a href="#">浙江省教育厅</a> •
      <a href="#">省国防科工办</a> •
      <a href="#">杭州市钱塘区人民政府</a>
    </div>
    <div class="copyright">
      Copyright © 2024 All Rights Reserved 中国·浙江·杭州 浙ICP备12028388号-2.
      浙公网安备34030002000595号
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const slides = ref([
  {
    image: "F:/dachuang/wp/exercise/src/components/R-C.jpg",
    alt: "科技新闻",
    title: "探索未来科技新趋势",
    description: "人工智能发展进入快车道",
  },
  {
    image: "F:/dachuang/wp/exercise/src/components/school.jpg",
    alt: "商业资讯",
    title: "全球金融市场动态分析",
    description: "掌握第一手经济数据",
  },
]);

const activities = ref([
  { title: "新生入学说明会", time: "每周五下午2点", location: "3号楼报告厅" },
  {
    title: "家长开放日活动",
    time: "8月15日-18日",
    location: "课程体验、校园参观",
  },
  { title: "艺术节作品展", time: "7月20日-25日", location: "学校美术馆" },
]);

const sections = ref([
  {
    title: "通知.公告",
    items: [
      { time: "2025.3.4", content: "开幕式暨主题演讲" },
      { time: "2025.3.4", content: "行业领袖圆桌论坛" },
      { time: "2025.3.4", content: "交流酒会与颁奖典礼" },
    ],
  },
  {
    title: "讲座.论坛",
    items: [
      { time: "2025.3.4", content: "开幕式暨主题演讲" },
      { time: "2025.3.4", content: "行业领袖圆桌论坛" },
      { time: "2025.3.4", content: "交流酒会与颁奖典礼" },
    ],
  },
  {
    title: "专题.专栏",
    items: [
      { time: "2025.3.4", content: "开幕式暨主题演讲" },
      { time: "2025.3.4", content: "行业领袖圆桌论坛" },
      { time: "2025.3.4", content: "交流酒会与颁奖典礼" },
    ],
  },
]);

const events = ref([
  {
    title: "电气学院与华电衢州乌溪江分公司签署党建联建协议",
    time: "2025-02-26",
    tags: ["办学特色", "人才培养"],
    description:
      "为积极探索党建联建新模式，推进党建工作和业务深度融合发展，提升人才培养质量....",
    active: false,
  },
]);

const dataCircles = ref([
  { icon: "🎓", text: "28000+<br>在校生" },
  { icon: "🏛️", text: "19+<br>学院单位" },
  { icon: "👨🏫", text: "2700+<br>教职工" },
  { icon: "📚", text: "11<br>科研项目" },
]);

const currentSlide = ref(0);

const showSlide = (n) => {
  currentSlide.value = (n + slides.value.length) % slides.value.length;
};

onMounted(() => {
  setInterval(() => {
    showSlide(currentSlide.value + 1);
  }, 5000);
});

const toggleActive = (item) => {
  item.active = !item.active;
};

const toggleEvent = (event) => {
  event.active = !event.active;
  if (event.active) {
    events.value.forEach((e) => {
      if (e !== event) e.active = false;
    });
  }
};
</script>

<style scoped>
/* 基础重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

/* 轮播容器 */
.carousel-modern {
  margin-bottom: 50px;
  width: 100%;
  height: 520px;
  position: relative;
  overflow: hidden;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.carousel-item {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  transform: scale(1.02);
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

.carousel-item.active {
  opacity: 1;
  transform: scale(1);
}

.carousel-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 35%;
}

/* 动态覆盖层 */
.carousel-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
}
/* 主要内容区 */

.main-content {
  display: flex;
  gap: 30px;
  max-width: 1200px;

  margin-left: 10px;
}

/* 左侧内容 */
.left-panel {
  flex: 5;
}

.activity-image {
  width: 700px;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-left: 20px;
}

.activity-image img {
  width: 1000px;
  height: 600px;
  object-fit: cover;
}

.activity-content {
  margin-top: 25px;
  padding: 25px;
  border-radius: 12px;
  line-height: 1.8;
}
.head {
  color: red;
}
.son {
  width: 500px;
  color: gray;
  font-size: 10px;
}
.honor-title {
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1em;
  margin: 15px 0;
}

.honor-title:hover {
  color: #007bff;
  text-decoration: underline;
}
/* 右侧活动列表 */
.right-panel {
  flex: 5;
}

.activity-list {
  background: #fff;

  border-radius: 12px;
  margin-left: 5px;
}

.activity-item {
  padding: 25px;
  margin-bottom: 20px;
  border-left: 3px solid #007bff;
  background: #f5f9ff;
  border-radius: 6px;
  transition: transform 0.3s ease;
}

.activity-item:hover {
  transform: translateX(10px);
}

.activity-item h3 {
  color: #333;
  margin-bottom: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }

  .carousel {
    height: 250px;
  }

  .activity-image {
    height: 200px;
  }
}

/* 响应式优化 */
@media (max-width: 768px) {
  .carousel-modern {
    height: 400px;
  }

  .carousel-overlay {
    padding: 20px;
  }

  .nav-modern {
    flex-direction: column;
    margin: 20px;
  }

  .indicator-dot {
    width: 24px;
    height: 3px;
  }

  .indicator-dot.active {
    width: 36px;
  }
}

/* 为父容器启用 Flex 布局 */
.third {
  display: flex; /* 核心布局模式 */
  gap: 20px; /* 可选：设置子元素间距 */
  justify-content: space-between; /* 可选：子元素均匀分布 */
  margin-top: 50px;
  margin-bottom: 50px;
}

/* 子元素样式控制 */
.third-one {
  width: 80%;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

.text-block {
  display: flex;
  gap: 20px;
  padding: 50px 0;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.text-block:last-child {
  border-bottom: none;
}

.time-block {
  flex: 0 0 120px;
  font-size: 1.2em;
  color: #0066cc;
  font-weight: bold;
}

.content-block {
  flex: 1;
  color: #333;
}

.text-block.active,
.text-block:active {
  color: #0066cc;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.text-block:hover {
  background: rgba(0, 102, 204, 0.05);
}

h1 {
  font-family: "隶书", "篆书", serif; /* 更具古风的标题字体 */
  font-size: 40px;

  color: black; /* 棕色标题 */
  margin-bottom: 30px;
}

:root {
  --primary-color: #6366f1;
  --secondary-color: #10b981;
  --accent-color: #f59e0b;
  --bg-gradient: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Inter", "Microsoft YaHei", sans-serif;
}

body {
  background: var(--bg-gradient);
  min-height: 100vh;
}

.container {
  max-width: 1000px;

  padding: 0 1.5rem;
}

.event-list {
  border-radius: 1.5rem;

  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.05),
    0 4px 6px -2px rgba(0, 0, 0, 0.025);
}

.event-item {
  position: relative;
  padding: 1.25rem;
  margin: 0.75rem 0;
  border-radius: 0.75rem;
  background: rgba(185, 212, 222, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 1px solid #f1f5f9;
}

.event-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: var(--primary-color);
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.3s;
}

.event-item:hover {
  transform: translateX(8px);
  box-shadow: 2px 4px 12px rgba(0, 0, 0, 0.08);
}

.event-item:hover::before {
  opacity: 1;
}

.event-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.event-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.event-title {
  color: #1e293b;
  font-size: 1.125rem;
  letter-spacing: -0.5px;
}

.event-time {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #84a7d4;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.dropdown-content {
  position: relative;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.event-item.active .dropdown-content {
  max-height: 400px;
}

.detail-content {
  padding: 1.5rem;
  margin-top: 1rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  position: relative;
}

.detail-content::before {
  content: "";
  position: absolute;
  top: -4px;
  left: 24px;
  width: 12px;
  height: 12px;
  background: #f8fafc;
  transform: rotate(45deg);
}

.tag-list {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 4rem;
  font-size: 0.875rem;
  color: var(--primary-color);
}

.detail-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: var(--primary-color);
  color: white !important;
  border-radius: 0.5rem;
  text-decoration: none;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.detail-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2);
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.event-item {
  display: flex; /* 改为弹性布局 */
  gap: 1.5rem;
  overflow: hidden;
  padding: 0; /* 更新原始padding */
  margin-top: 5px;
}

.event-media {
  width: 500px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.event-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.event-content {
  flex: 1;
  padding: 1.25rem 1.25rem 1.25rem 0;
}

/* 调整悬停效果 */
.event-item:hover {
  transform: translateX(0); /* 取消横向偏移 */
}

.event-item:hover .event-media {
  width: 550px; /* 展开图片区域 */
}

.event-item:hover .event-image {
  transform: scale(1.05);
}

/* 详情展开适配 */
.event-item.active .event-media {
  width: 500px;
}

/* 美观调整 */
.event-media::after {
  content: "";
  position: absolute;
  right: -15px;
  top: 0;
  bottom: 0;
  width: 300px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 1) 100%
  );
  z-index: 1;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .event-item {
    flex-direction: column;
  }

  .event-media {
    width: 100% !important;
    height: 200px;
  }
}
.data-wrapper {
  width: 100%;

  margin: 40px auto;
  padding: 2rem;
  margin-bottom: 50px;
  border-radius: 20px;
}

.circle-group {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 24px;
}

.data-circle {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: linear-gradient(145deg, #e3f2fd, #bbdefb);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  position: relative;
  transition: transform 0.3s ease;
}

.data-circle:hover {
  transform: scale(1.05);
}

/* 中心对齐系统 */
.circle-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 80%;
}

.data-icon {
  font-size: 3rem;
  color: #0056b3;
  margin-bottom: 1rem;
  filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.1));
}

.data-text {
  color: #1a4377;
  line-height: 1.4;
  font-size: 1.1rem;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.5);
}

/* 添加虚线外框 */
.data-circle::after {
  content: "";
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border: 2px dashed rgba(0, 123, 255, 0.3);
  border-radius: 50%;
}

/* 增加悬浮阴影 */
.data-circle:hover {
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .data-circle {
    width: 140px;
    height: 140px;
  }

  .data-icon {
    font-size: 2rem;
  }

  .data-text {
    font-size: 0.9rem;
  }
}
@media (max-width: 480px) {
  .data-circle {
    width: 120px;
    height: 120px;
  }

  .data-icon {
    font-size: 1.8rem;
  }

  .data-text {
    font-size: 0.8rem;
  }
}
h5 {
  margin-top: 50px;

  font-family: "隶书", "篆书", serif; /* 更具古风的标题字体 */
  font-size: 40px;
  text-align: center;
  color: black; /* 棕色标题 */
}

.footer {
  background-color: #003366; /* 深蓝色背景 */
  color: white;
  padding: 10px 0;
  text-align: center;
}
.footer a {
  color: white;
  margin: 0 15px;
  text-decoration: none;
  transition: color 0.3s; /* 平滑颜色变化 */
}
.footer a:hover {
  color: #1e90ff; /* 鼠标悬停时的文字颜色 */
}
.copyright {
  background-color: #003366; /* 深蓝色背景 */
  color: white;
  padding: 10px 0;
  text-align: center;
  font-size: 12px;
}
</style>
