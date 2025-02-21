<template>
  <a-menu v-model:selectedKeys="current" mode="horizontal" :items="menuItems" />
</template>

<script lang="ts" setup>
import { h, ref, computed } from "vue";
import * as Icons from "@ant-design/icons-vue";
import { MenuProps, Input, Popconfirm } from "ant-design-vue";
import { store } from "../store";
import { useRouter } from "vue-router";

const current = ref<string[]>(["mail"]);
const value = ref<string>("");

const onSearch = (searchValue: string) => {
  console.log("Search:", searchValue);
};

const router = useRouter();

const onLogout = () => {
  store.logout();
  router.push("/");
};

// 动态生成导航菜单项
const menuItems = computed<MenuProps["items"]>(() => [
  {
    key: "home",
    icon: () => h(Icons.HomeOutlined),
    label: h("a", { href: "/" }, "主页"),
    title: "主页",
  },
  {
    key: "luntan",
    icon: () => h(Icons.BankOutlined),
    label: h("a", { href: "/forum/together" }, "水声"),
    title: "水声",
  },
  {
    key: "AI",
    icon: () => h(Icons.CommentOutlined),
    label: h("a", { href: "/chat", target: "" }, "滴答"),
    title: "滴答",
  },
  {
    key: "sutuo",
    icon: () => h(Icons.BulbOutlined),
    label: h("a", { href: "/", target: "_blank" }, "素拓"),
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
    key: "message",
    icon: () => h(Icons.BellOutlined),
    label: h("a", { href: "https://antdv.com" }, "消息"),
    title: "消息",
  },
  {
    key: "person",
    icon: () => h(Icons.UserOutlined),
    label: h("a", { href: "" }, store.name), // 动态绑定 store.name
    title: store.name,
    children: [
      {
        label: h("a", { href: `/person/center` }, "个人中心"),
        key: "Personal Center",
      },
      {
        label: h(
          Popconfirm,
          {
            title: "确定要退出登录吗？",
            onConfirm: onLogout,
          },
          {
            default: () => "退出登录",
          },
        ),
        key: "setting:2",
      },
    ],
  },
]);
</script>
