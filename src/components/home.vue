<template>
  <div class="all">
    <div class="slider">
      <div class="slides">
        <div class="slide active">
          <img
            src="F:\dachuang\wp\exercise\src\assets\avatar.jpg"
            alt="Image 1"
          />
        </div>
        <div class="slide">
          <img src="F:\dachuang\wp\exercise\src\assets\vue.svg" alt="Image 2" />
        </div>
        <div class="slide">
          <img
            src="F:\dachuang\wp\exercise\src\assets\logo.jpg"
            alt="Image 3"
          />
        </div>
      </div>
      <div class="slider-btn left" @click="prevSlide">
        <i class="fa-solid fa-arrow-left"></i>
      </div>
      <div class="slider-btn right" @click="nextSlide">
        <i class="fa-solid fa-arrow-right"></i>
      </div>
      <div>
        <a href="#">意见反馈留言板</a>
        <p>电话:198-0397-9786</p>
        <hr />
        <span><a href="#">网站简介</a></span>
        <span><a href="#">广告服务</a></span>
        <span><a href="#">产品答疑</a></span>
        <span><a href="#">联系我们</a></span>
      </div>
    </div>
    <div class="first">
      <div class="biaoti1">
        <h1>最新内容</h1>
      </div>
      <div class="one">
        <a href="#" class="web_secure">网络安全</a>
        <a href="#"
          >web_secure可以基于攻击和防御视角来分类，我们经常听到的
          “红队”、“渗透测试”
          等就是研究攻击技术，而“蓝队”、“安全运营”、“安全运维”则研究防御技术。</a
        >
        <div>
          <a href="#" class="icon-text"
            >点赞 <i class="fa-regular fa-thumbs-up"></i
          ></a>
          <a href="#" class="icon-text"
            >收藏 <i class="fa-regular fa-heart"></i
          ></a>
          <a href="#" class="icon-text"
            >踩 <i class="fa-regular fa-thumbs-down"></i
          ></a>
          <a href="#" class="icon-text"
            >评论 <i class="fa-regular fa-comment"></i
          ></a>
        </div>
      </div>
      <div class="tow">
        <a href="#" class="web_secure">网络安全</a>
        <div class="jianju">
          <a href="#"
            >web_secure可以基于攻击和防御视角来分类，我们经常听到的
            “红队”、“渗透测试”
            等就是研究攻击技术，而“蓝队”、“安全运营”、“安全运维”则研究防御技术。</a
          >
        </div>
        <div>
          <a href="#" class="icon-text"
            >点赞 <i class="fa-regular fa-thumbs-up"></i
          ></a>
          <a href="#" class="icon-text"
            >收藏 <i class="fa-regular fa-heart"></i
          ></a>
          <a href="#" class="icon-text"
            >踩 <i class="fa-regular fa-thumbs-down"></i
          ></a>
          <a href="#" class="icon-text"
            >评论 <i class="fa-regular fa-comment"></i
          ></a>
        </div>
      </div>
    </div>
    <div class="second">
      <div class="biaoti2">
        <h1>向你推荐</h1>
      </div>
      <div class="one1">
        <a href="#" class="web_secure">网络安全</a>
        <div class="jianju">
          <a href="#"
            >web_secure可以基于攻击和防御视角来分类，我们经常听到的
            “红队”、“渗透测试”
            等就是研究攻击技术，而“蓝队”、“安全运营”、“安全运维”则研究防御技术。</a
          >
        </div>
        <div>
          <a href="#" class="icon-text"
            >点赞 <i class="fa-regular fa-thumbs-up"></i
          ></a>
          <a href="#" class="icon-text"
            >收藏 <i class="fa-regular fa-heart"></i
          ></a>
          <a href="#" class="icon-text"
            >踩 <i class="fa-regular fa-thumbs-down"></i
          ></a>
          <a href="#" class="icon-text"
            >评论 <i class="fa-regular fa-comment"></i
          ></a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

let index = ref(0);
const slides = ref(null);

const nextSlide = () => {
  if (slides.value) {
    slides.value[index.value].classList.remove("active");
    index.value = (index.value + 1) % slides.value.length;
    slides.value[index.value].classList.add("active");
  }
};

const prevSlide = () => {
  if (slides.value) {
    slides.value[index.value].classList.remove("active");
    index.value = (index.value - 1 + slides.value.length) % slides.value.length;
    slides.value[index.value].classList.add("active");
  }
};

onMounted(() => {
  slides.value = document.querySelectorAll(".slide");
  const interval = setInterval(nextSlide, 3000);
  onUnmounted(() => clearInterval(interval));
});
</script>

<style scoped>
.all {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.first,
.second {
  width: 48%;
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid hwb(0 80% 20%);
  max-height: 600px;
  overflow-y: auto;
  margin-left: 10px;
}
.biaoti1,
.biaoti2 {
  background-color: #f0f0f0;
  padding: 10px;
  margin-bottom: 10px;
}
.web_secure {
  background-color: #e6f7ff;
  color: #007bff;
  font-weight: bold;
  padding: 5px 10px;
  margin-bottom: 10px;
  display: block;
  text-decoration: none;
}
.web_secure:hover {
  text-decoration: underline;
}
.one,
.tow,
.one1 {
  margin-bottom: 10px;
}
a {
  text-decoration: none;
  color: #000;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
a:hover {
  text-decoration: underline;
}
.icon-text {
  display: inline-flex;
  align-items: center;
  margin-right: 5px;
}
.icon-text i {
  margin-right: 5px;
}
.jianju {
  margin-top: 10px;
  margin-bottom: 10px;
  font-size: 16px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}
.slider {
  margin-left: 20px;
  margin-right: 20px;
  width: 48%;
  overflow: hidden;
  position: relative;
}
.slides {
  display: flex;
  transition: transform 0.5s ease;
}
.slide {
  min-width: 100%;
  transition: opacity 1s ease;
  opacity: 0;
}
.slide.active {
  opacity: 1;
}
.slide img {
  width: 100%;
  display: block;
}
.slider-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 10px;
  border-radius: 50%;
  z-index: 10;
}
.slider-btn.left {
  left: 10px;
}
.slider-btn.right {
  right: 10px;
}
</style>
