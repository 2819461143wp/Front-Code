import { reactive } from "vue";
import { message } from "ant-design-vue";

export const store = reactive({
  isLoggedIn: localStorage.getItem("isLoggedIn") === "true",
  userId: localStorage.getItem("userId") || "",
  name: localStorage.getItem("userName") || "",
  image: localStorage.getItem("userImage") || "",
  login(id: string, name: string) {
    this.isLoggedIn = true;
    this.userId = id;
    this.name = name;
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userId", id);
    localStorage.setItem("userName", name);
  },
  logout() {
    this.isLoggedIn = false;
    this.userId = "";
    this.name = "";
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    message.success("Logout successfully");
  },
  updateName(name: string) {
    this.name = name; // 修改响应式数据
    localStorage.setItem("userName", name);
  },
  updateImage(image: string) {
    this.image = image;
    localStorage.setItem("userImage", image);
  },
});
