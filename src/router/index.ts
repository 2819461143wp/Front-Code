import { createRouter, createWebHistory } from "vue-router";
import Login from "../components/before-login/Login.vue";
import Register from "../components/before-login/Register.vue";
import Empty from "../components/Empty.vue";
import Forgot from "../components/Forgot.vue";
import Posting from "../components/forum/Posting.vue";
import Person from "../components/person/Person.vue";
import Home from "../components/Home.vue";
import Chat from "../components/Chat.vue";
import Forum from "../components/forum/Forum.vue";
import Center from "../components/person/Center.vue";
import Setting from "../components/person/Setting.vue";
import Together from "../components/forum/Together.vue";
import Classify from "../components/forum/Classify.vue";
import Test from "../components/forum/test.vue";
import Score from "../components/Score.vue";
import caogao from "../components/caogao.vue";
import Admin from "../components/admin/Admin.vue";
import SutuoInsert from "../components/admin/SutuoInsert.vue";
import SutuoList from "../components/admin/SutuoList.vue";
import UserUpdate from "../components/admin/UserUpdate.vue";
import UserInsert from "../components/admin/UserInsert.vue";

const routes = [
  { path: "/", component: Empty },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/forgot", component: Forgot },
  { path: "/score", component: Score },
  { path: "/caogao", component: caogao },
  {
    path: "/forum",
    component: Forum,
    children: [
      { path: "posting", component: Posting },
      { path: "together/page/:page", component: Together },
      { path: "classify/:status/page/:page", component: Classify },
      { path: "test", component: Test },
    ],
  },
  {
    path: "/person",
    component: Person,
    children: [
      { path: "center", component: Center },
      { path: "setting", component: Setting },
    ],
  },
  { path: "/home", component: Home },
  { path: "/chat", component: Chat },
  {
    path: "/admin",
    component: Admin,
    children: [
      { path: "sutuo/excel", component: SutuoInsert },
      { path: "sutuo/list", component: SutuoList },
      { path: "user/update", component: UserUpdate },
      { path: "user/insert", component: UserInsert },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
