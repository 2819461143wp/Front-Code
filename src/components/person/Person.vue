<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider
      breakpoint="lg"
      collapsed-width="0"
      @collapse="onCollapse"
      @breakpoint="onBreakpoint"
      class="custom-sider"
      :width="240"
    >
      <div class="logo" />
      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="dark"
        mode="inline"
        class="custom-menu"
      >
        <div class="menu-category">个人中心</div>
        <a-menu-item key="center" @click="() => router.push('/person/center')">
          <template #icon>
            <Icons.UserOutlined />
          </template>
          <span class="nav-text">个人信息</span>
        </a-menu-item>
        <a-menu-item
          key="setting"
          @click="() => router.push('/person/setting')"
        >
          <template #icon>
            <Icons.SettingOutlined />
          </template>
          <span class="nav-text">设置</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-content :style="{ margin: '0 16px' }">
        <div
          :style="{ padding: '24px', background: '#fff', minHeight: '100vh' }"
        >
          <router-view />
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
  height: 200px;
  background: url("../../assets/img/logo.png") no-repeat center;
  background-size: 80%;
  margin: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.custom-sider {
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
}

.custom-menu {
  padding-top: 12px;
}

.custom-menu :deep(.ant-menu-item) {
  height: 50px;
  line-height: 50px;
  margin: 4px 0;
  border-radius: 0 24px 24px 0;
  margin-right: 16px;
  transition: all 0.3s ease;
}

.custom-menu :deep(.ant-menu-item-selected) {
  background: linear-gradient(
    to right,
    #1890ff 0%,
    rgba(24, 144, 255, 0.5) 100%
  );
  color: #fff;
}

.custom-menu :deep(.ant-menu-item:hover:not(.ant-menu-item-selected)) {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.custom-menu :deep(.ant-menu-item-icon) {
  font-size: 18px;
  vertical-align: middle;
}

.menu-category {
  color: rgba(255, 255, 255, 0.45);
  font-size: 12px;
  margin: 16px 16px 8px 24px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-text {
  margin-left: 8px;
  font-size: 15px;
  transition: color 0.3s ease;
}

[data-theme="dark"] .site-layout-sub-header-background {
  background: #141414;
}

.site-layout-background {
  background: #fff;
}
</style>
