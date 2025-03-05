<template>
  <div class="login-container">
    <a-form
      :model="formState"
      name="normal_login"
      class="login-form"
      @finishFailed="onFinishFailed"
    >
      <a-form-item
        label="账号"
        name="账号"
        :rules="[{ required: true, message: '请输入你的账号!' }]"
      >
        <a-input v-model:value="formState.username">
          <template #prefix>
            <UserOutlined class="site-form-item-icon" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item
        label="密码"
        name="密码"
        :rules="[{ required: true, message: '请输入你的密码！' }]"
      >
        <a-input-password v-model:value="formState.password">
          <template #prefix>
            <LockOutlined class="site-form-item-icon" />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item>
        <a-form-item name="remember" no-style>
          <a-checkbox v-model:checked="formState.remember"
            >Remember me</a-checkbox
          >
        </a-form-item>
        <a class="login-form-forgot" href="/Forgot">忘记密码</a>
      </a-form-item>

      <a-form-item>
        <a-button
          :disabled="disabled"
          type="primary"
          html-type="button"
          class="login-form-button"
          @click="handleSubmit"
        >
          Log in
        </a-button>
        Or
        <a href="/Register">没有账号？点击注册</a>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from "vue";
import axios from "axios";
import { store } from "../../store";
import { UserOutlined, LockOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";

interface FormState {
  username: string;
  password: string;
  remember: boolean;
}

const router = useRouter();

const formState = reactive<FormState>({
  username: "",
  password: "",
  remember: true,
});

const handleSubmit = async () => {
  try {
    const userResponse = await axios.post("/api/user/login", formState); //axios已经自动转为json格式
    if (userResponse.data.id) {
      const characterResponse = await axios.get(
        `/api/character/${userResponse.data.id}`,
      );
      message.success("登录成功");
      if (userResponse.data.role === "user") {
        store.login(userResponse.data.id, characterResponse.data.name, "user");
        console.log(store.role);
        router.push("/home");
      }
      if (userResponse.data.role === "admin") {
        store.login(userResponse.data.id, characterResponse.data.name, "admin");
        console.log(store.role);
        router.push("/admin");
      }
    } else {
      message.error("登录失败,账号或密码错误");
    }
  } catch (error) {
    message.error("当前网络不稳定，连接失败");
  }
};

const onFinishFailed = (errorInfo: any) => {
  console.log("Failed:", errorInfo);
};

const disabled = computed(() => {
  return !(formState.username && formState.password);
});
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login-form {
  max-width: 300px;
  width: 100%;
}

.login-form-forgot {
  float: right;
}

.login-form-button {
  width: 100%;
}
</style>
