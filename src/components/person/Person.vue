<template>
  <a-layout style="min-height: 100vh">
    <!-- 设置布局的最小高度为100vh，填充整个视口高度 -->
    <a-layout-sider
      breakpoint="lg"
      collapsed-width="0"
      @collapse="onCollapse"
      @breakpoint="onBreakpoint"
    >
      <!-- 设置响应式断点为lg -->
      <!-- 设置折叠后的宽度为0 -->
      <!-- 监听折叠事件 -->
      <!-- 监听断点事件 -->
      <div class="logo" />
      <!-- logo区域 -->
      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
        <!-- 菜单，深色主题，内联模式 -->
        <!--        <a-menu-item key="together">-->
        <!--          &lt;!&ndash; 菜单项2 &ndash;&gt;-->
        <!--          <video-camera-outlined />-->
        <!--          &lt;!&ndash; 摄像机图标 &ndash;&gt;-->
        <!--          <span class="nav-text">总和</span>-->
        <!--          &lt;!&ndash; 菜单文本 &ndash;&gt;-->
        <!--        </a-menu-item>-->
        <!--        <a-menu-item key="posting" @click="() => router.push('/forum/posting')">-->
        <!--          &lt;!&ndash; 菜单项1 &ndash;&gt;-->
        <!--          <Icons.FormOutlined />-->
        <!--          &lt;!&ndash; 用户图标 &ndash;&gt;-->
        <!--          <span class="nav-text">发帖</span>-->
        <!--          &lt;!&ndash; 菜单文本 &ndash;&gt;-->
        <!--        </a-menu-item>-->
        <!--        <a-menu-item key="2">-->
        <!--          &lt;!&ndash; 菜单项2 &ndash;&gt;-->
        <!--          <video-camera-outlined />-->
        <!--          &lt;!&ndash; 摄像机图标 &ndash;&gt;-->
        <!--          <span class="nav-text">闲置</span>-->
        <!--          &lt;!&ndash; 菜单文本 &ndash;&gt;-->
        <!--        </a-menu-item>-->
        <!--        <a-menu-item key="3">-->
        <!--          &lt;!&ndash; 菜单项3 &ndash;&gt;-->
        <!--          <upload-outlined />-->
        <!--          &lt;!&ndash; 上传图标 &ndash;&gt;-->
        <!--          <span class="nav-text">求助</span>-->
        <!--          &lt;!&ndash; 菜单文本 &ndash;&gt;-->
        <!--        </a-menu-item>-->
        <a-menu-item key="center" @click="() => router.push('/person/center')">
          <Icons.UserOutlined />
          <span class="nav-text">个人信息</span>
        </a-menu-item>
        <a-menu-item
          key="setting"
          @click="() => router.push('/person/setting')"
        >
          <Icons.SettingOutlined />
          <span class="nav-text">设置</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-content :style="{ margin: '0 16px' }">
        <!-- 设置内容区域的左右外边距为16px -->
        <div
          :style="{ padding: '24px', background: '#fff', minHeight: '100vh' }"
        >
          <!-- 设置内容区域的内边距为24px，背景色为白色，最小高度为100vh -->
          <router-view />
          <!-- 内容文本 -->
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import * as Icons from "@ant-design/icons-vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const onCollapse = (collapsed: boolean, type: string) => {
  console.log(collapsed, type);
};

const onBreakpoint = (broken: boolean) => {
  console.log(broken);
};

// 根据路由路径获取当前应该选中的菜单项
const getSelectedKey = (path: string) => {
  if (path.includes("/person/center")) return "center";
  if (path.includes("/person/setting")) return "setting";
  return "center"; // 默认选中个人信息
};

const selectedKeys = ref<string[]>([getSelectedKey(route.path)]);

// 监听路由变化
router.afterEach((to) => {
  selectedKeys.value = [getSelectedKey(to.path)];
});
</script>

<style scoped>
.logo {
  height: 200px; /*logo区域的高度为32px*/
  background: rgba(255, 255, 255, 0.2); /*logo区域的背景色为半透明白色*/
  margin: 16px; /*logo区域的外边距为16px*/
  background: url("../../assets/img/logo.png") no-repeat center; /*logo区域的背景图片为logo.png*/
}

.site-layout-sub-header-background {
  background: #fff; /*<!-- 子头部背景色为白色 -->*/
}

.site-layout-background {
  background: #fff; /*<!-- 布局背景色为白色 -->*/
}

[data-theme="dark"] .site-layout-sub-header-background {
  background: #141414; /*<!-- 深色主题下子头部背景色为深灰色 -->*/
}
</style>
