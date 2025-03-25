<template>
  <a-layout>
    <a-layout-header class="header">
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
import GlobalHeader from "../components/before-login/GlobalHeader-before-login.vue";
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
  border-bottom: 20px; /* Add bottom border */
}

.header {
  background: white;
  margin-bottom: 16px;
  color: unset;
  padding-inline: 20px;
}
</style>
