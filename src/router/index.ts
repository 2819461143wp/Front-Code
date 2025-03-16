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
import Admin from "../components/admin/admin.vue";
import Exer from "../components/admin/widgets/exer.vue";
import Excel from "../components/admin/excel.vue";

const routes = [
  { path: "/", component: Empty },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/forgot", component: Forgot },
  { path: "/admin", component: Admin },
  { path: "/score", component: Score },
  { path: "/exer", component: Exer },
  { path: "/caogao", component: caogao },
  { path: "/excel", component: Excel },
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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
