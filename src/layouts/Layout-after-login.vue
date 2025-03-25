<template>
  <a-layout>
    <!-- 使用 v-if 判断当前路由是否需要显示头部 -->
    <a-layout-header v-if="!isAdminRoute" class="header">
      <GlobalHeader />
    </a-layout-header>

    <a-layout-content :class="{ 'admin-content': isAdminRoute }">
      <div class="components-input-demo-presuffix">
        <router-view />
      </div>
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import GlobalHeader from "../components/GlobalHeader-after-login.vue";
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

// 判断当前路由是否为 admin 相关路由
const isAdminRoute = computed(() => {
  return route.path.startsWith("/admin");
});
</script>

<style scoped>
.foot {
  background: #97bbdd;
  text-align: center;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  margin-top: 16px;
}

.components-input-demo-presuffix {
  border-bottom: 20px;
}

.header {
  background: white;
  margin-bottom: 16px;
  color: unset;
  padding-inline: 20px;
}

/* admin 路由下的内容样式 */
.admin-content {
  margin-left: 200px; /* 与侧边栏宽度相同 */
  transition: margin-left 0.3s;
}
</style>
