<template>
  <div class="admin-container">
    <el-aside :class="{ 'is-collapsed': isCollapse }">
      <el-menu
        router
        unique-opened
        :collapse="isCollapse"
        :default-active="router.currentRoute.value.path"
      >
        <!-- Logo区域 -->
        <div class="logo-container">
          <img src="/src/assets/img/logo.png" alt="Logo" />
          <h1 v-show="!isCollapse">大学生自驱成长平台后台管理系统</h1>
          <el-icon class="collapse-btn" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
        </div>

        <!-- 系统管理 -->
        <el-sub-menu index="/admin/system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/admin/system/menus">
            <el-icon><Document /></el-icon>
            <span>菜单管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/system/roles">
            <el-icon><User /></el-icon>
            <span>角色管理</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="/admin/user">
          <template #title>
            <el-icon><UserFilled /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/admin/user/update">
            <el-icon><Edit /></el-icon>
            <span>用户信息修改</span>
          </el-menu-item>
          <el-menu-item index="/admin/user/insert">
            <el-icon><Upload /></el-icon>
            <span>用户批量创建</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="/admin/sutuo">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>素拓管理</span>
          </template>
          <el-menu-item index="/admin/sutuo/excel">
            <el-icon><Upload /></el-icon>
            <span>素拓信息上传</span>
          </el-menu-item>
          <el-menu-item index="/admin/sutuo/search">
            <el-icon><Search /></el-icon>
            <span>素拓信息查询</span>
          </el-menu-item>
          <el-menu-item index="/admin/sutuo/update">
            <el-icon><Edit /></el-icon>
            <span>素拓信息修改</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <div class="main-container" :class="{ 'is-collapsed': isCollapse }">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref } from "vue";
import {
  Setting,
  User,
  Document,
  Fold,
  Expand,
  Search,
} from "@element-plus/icons-vue";
import { UserFilled, Edit, Upload } from "@element-plus/icons-vue";
const router = useRouter();
const isCollapse = ref(false);

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};
</script>

<style scoped>
.admin-container {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
  position: relative;
}

.main-container {
  flex: 1;
  margin-left: 220px;
  padding: 0; /* Remove padding here */
  transition: all 0.3s;
  background-color: #f5f7fa;
  min-height: 100vh;
  overflow: hidden;

  &.is-collapsed {
    margin-left: 64px;
  }
}

.logo-container {
  height: 64px;
  padding: 16px;
  display: flex;
  align-items: center;
  background-color: #002140;
  overflow: hidden;

  img {
    width: 32px;
    height: 32px;
    margin-right: 12px;
    transition: all 0.3s;
  }

  h1 {
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    white-space: nowrap;
    flex: 1;
    opacity: 1;
    transition: all 0.3s;
  }

  .collapse-btn {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.65);
    cursor: pointer;
    transition: all 0.3s;
    padding: 4px;
    border-radius: 4px;

    &:hover {
      color: #fff;
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
}

/* 添加侧边栏样式 */
:deep(.el-aside) {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 220px !important;
  transition: all 0.3s;
  background-color: #001529;
  z-index: 1000;

  &.is-collapsed {
    width: 64px !important;
  }

  .el-menu {
    border-right: none;
    height: 100%;
  }
}
</style>
