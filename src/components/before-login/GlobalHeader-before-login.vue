<template>
  <a-menu v-model:selectedKeys="current" mode="horizontal" :items="items" />
</template>

<script lang="ts" setup>
import { h, ref } from "vue";
import * as Icons from "@ant-design/icons-vue";
import { MenuProps, Input } from "ant-design-vue";

const current = ref<string[]>(["mail"]);
const value = ref<string>("");

const onSearch = (searchValue: string) => {
  console.log("Search:", searchValue);
};

const items = ref<MenuProps["items"]>([
  {
    key: "home",
    icon: () => h(Icons.HomeOutlined),
    label: h("a", { href: "/" }, "主页"),
    title: "主页",
  },
  {
    key: "luntan",
    icon: () => h(Icons.BankOutlined),
    label: h("a", { href: "/login" }, "水声"),
    title: "水声",
  },
  {
    key: "AI",
    icon: () => h(Icons.CommentOutlined),
    label: h("a", { href: "/login", target: "" }, "滴答"),
    title: "滴答",
  },
  {
    key: "sutuo",
    icon: () => h(Icons.BulbOutlined),
    label: h("a", { href: "/login", target: "" }, "素拓"),
    title: "素拓",
  },
  {
    key: "search",
    label: h(Input.Search, {
      value: value.value,
      placeholder: "input search text",
      style: { width: "200px", marginTop: "20px" },
      onSearch: onSearch,
      "onUpdate:value": (val: string) => (value.value = val),
    }),
    style: { marginLeft: "auto" },
  },
  {
    key: "login",
    icon: () => h(Icons.UserOutlined),
    label: h("a", { href: "/login" }, "登录"),
    title: "登录",
  },
]);
</script>
