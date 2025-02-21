<template>
  <div id="app">
    <component :is="layoutComponent" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { store } from "./store";
import LayoutBeforeLogin from "./layouts/Layout-before-login.vue";
import LayoutAfterLogin from "./layouts/Layout-after-login.vue";
const layoutComponent = computed(() => {
  return store.isLoggedIn ? LayoutAfterLogin : LayoutBeforeLogin;
});
</script>

<style scoped></style>
