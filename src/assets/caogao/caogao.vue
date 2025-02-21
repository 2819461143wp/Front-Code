<template>
  <div class="one">
    <div class="tow">
      <div class="avatar">
        <img src="" alt="头像" />
      </div>
      <div>
        <p>cwdppsky</p>
        <a href="#">总访问量</a>
        <a href="#">原创</a>
        <a href="#">排名</a>
        <a href="#">粉丝</a>
        <a href="#">学习成就</a>
        <a href="#">访客记录</a>
        <p>IP属地:浙江省</p>
      </div>
    </div>
    <div class="three">
      <h1>个人成就</h1>
      <hr />
      <p>
        <span class="icon"><i class="fas fa-thumbs-up"></i></span>获得点赞次数
      </p>
      <p>
        <span class="icon"><i class="fas fa-comment"></i></span>获得评论次数
      </p>
      <p>
        <span class="icon"><i class="fas fa-bookmark"></i></span>获得收藏次数
      </p>
    </div>
    <div class="four">
      <div class="dropdown" @click="toggleMenu($event, 'menu1')">
        <a href="#" class="dropbtn"
          ><span class="icon"><i class="fas fa-file-alt"></i></span>文章</a
        >
        <div
          class="dropdown-menu"
          :class="{ 'show-menu': activeMenu === 'menu1' }"
        >
          <a href="#">文章1</a>
          <a href="#">文章2</a>
        </div>
      </div>
      <div class="dropdown" @click="toggleMenu($event, 'menu2')">
        <a href="#" class="dropbtn"
          ><span class="icon"><i class="fas fa-folder"></i></span>资源</a
        >
        <div
          class="dropdown-menu"
          :class="{ 'show-menu': activeMenu === 'menu2' }"
        >
          <a href="#">资源1</a>
          <a href="#">资源2</a>
        </div>
      </div>
      <div class="dropdown" @click="toggleMenu($event, 'menu3')">
        <a href="#" class="dropbtn"
          ><span class="icon"><i class="fas fa-question-circle"></i></span
          >问答</a
        >
        <div
          class="dropdown-menu"
          :class="{ 'show-menu': activeMenu === 'menu3' }"
        >
          <a href="#">回答的问题</a>
          <a href="#">发出的问题</a>
        </div>
      </div>
      <div class="dropdown" @click="toggleMenu($event, 'menu4')">
        <a href="#" class="dropbtn"
          ><span class="icon"><i class="fas fa-bookmark"></i></span>收藏</a
        >
        <div
          class="dropdown-menu"
          :class="{ 'show-menu': activeMenu === 'menu4' }"
        >
          <a href="#">收藏1</a>
          <a href="#">收藏2</a>
        </div>
      </div>
      <div class="dropdown" @click="toggleMenu($event, 'menu5')">
        <a href="#" class="dropbtn"
          ><span class="icon"><i class="fas fa-thumbtack"></i></span>帖子</a
        >
        <div
          class="dropdown-menu"
          :class="{ 'show-menu': activeMenu === 'menu5' }"
        >
          <a href="#">回复的帖子</a>
          <a href="#">发布的帖子</a>
        </div>
      </div>
      <div class="dropdown" @click="toggleMenu($event, 'menu6')">
        <a href="#" class="dropbtn"
          ><span class="icon"><i class="fas fa-plus-circle"></i></span>更多</a
        >
        <div
          class="dropdown-menu"
          :class="{ 'show-menu': activeMenu === 'menu6' }"
        >
          <a href="#">关注</a>
          <a href="#">订阅</a>
        </div>
      </div>
    </div>
    <a href="#" class="transparent-btn edit-info">编辑信息</a>
    <a href="#" class="transparent-btn logout">退出登录</a>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
const route = useRoute();
const userId = route.params.userId;
console.log("User ID:", userId);
const activeMenu = ref(null);

const toggleMenu = (event, menu) => {
  event.stopPropagation();
  activeMenu.value = activeMenu.value === menu ? null : menu;
};

document.addEventListener("click", () => {
  activeMenu.value = null;
});
</script>

<style scoped>
body,
h1,
p,
a,
div {
  margin: 0;
  padding: 0;
  text-decoration: none;
  color: inherit;
}

body {
  font-family: Arial, sans-serif;
  background: url("../background.png") no-repeat center center fixed;
  background-size: cover;
  padding-top: 50px;
}

.one {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 50px);
  padding: 20px;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  margin: 20px;
  position: relative;
}

.tow {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 30px;
  background-color: #f9f9f9;
  text-align: left;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20px;
}

.avatar img {
  width: 100%;
  height: auto;
}

.tow a:not(:last-child) {
  margin-right: 15px;
  position: relative;
}

.tow a:not(:last-child)::after {
  content: "|";
  position: absolute;
  right: -8px;
  top: 50%;
  transform: translateY(-50%);
  color: #cccccc;
}

.three {
  margin-bottom: 20px;
  padding: 30px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
}

.four {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  padding: 30px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
}

.four a {
  margin-right: 15px;
  display: flex;
  align-items: center;
  padding: 10px;
  transition: transform 0.3s;
}

.four a:last-child {
  margin-right: 0;
}

.four a:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 5px rgba(0, 0, 0, 0.2);
}

hr {
  border: 0;
  height: 1px;
  background-color: #ccc;
  margin: 15px 0;
}

a {
  color: rgb(0, 179, 255);
  transition: color 0.3s;
}

a:active {
  color: #888888;
}

p {
  margin-bottom: 10px;
}

.icon {
  margin-right: 8px;
  color: rgb(0, 179, 255);
}

.dropdown-menu {
  display: none;
  position: absolute;
  background-color: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  padding: 10px 0;
  z-index: 1000;
}

.dropdown-menu a {
  display: block;
  padding: 10px 20px;
  color: #0000ee;
  text-decoration: none;
  transition: background-color 0.3s;
}

.dropdown-menu a:hover {
  background-color: #f4f4f4;
}

.show-menu {
  display: block;
}

.transparent-btn {
  padding: 10px 20px;
  border: 2px solid #f7f7f8;
  border-radius: 5px;
  color: rgb(163, 154, 154);
  text-align: center;
  display: inline-block;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.8);
  position: absolute;
  top: 30px;
}

.edit-info {
  right: 300px;
}

.logout {
  right: 100px;
}

.transparent-btn:hover {
  background-color: bisque;
  color: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.transparent-btn:active {
  transform: translateY(2px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
