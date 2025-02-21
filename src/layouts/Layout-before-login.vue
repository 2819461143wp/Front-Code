<template>
  <a-layout>
    <a-layout-header class="header">
      <GlobalHeader />
    </a-layout-header>

    <a-layout-content>
      <div class="components-input-demo-presuffix">
        <router-view />
      </div>
    </a-layout-content>

    <a-layout-footer class="foot">
      <a href="https://2819461143wp.github.io" target="_blank">
        <GithubOutlined /> by cwdp.sky
      </a>
    </a-layout-footer>
  </a-layout>
</template>

<script setup lang="ts">
import GlobalHeader from "../components/before-login/GlobalHeader-before-login.vue";
import { GithubOutlined } from "@ant-design/icons-vue";
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
