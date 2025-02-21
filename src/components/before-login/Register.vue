<template>
  <div class="register-container">
    <a-form
      :model="formState"
      name="register_form"
      class="register-form"
      @finish="onFinish"
      @finishFailed="onFinishFailed"
    >
      <a-form-item
        label="账号"
        name="username"
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
        name="password"
        :rules="[{ required: true, message: '请输入你的密码！' }]"
      >
        <a-input-password v-model:value="formState.password">
          <template #prefix>
            <LockOutlined class="site-form-item-icon" />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item
        label="验证码"
        name="verificationCode"
        :rules="[{ required: true, message: '请输入验证码！' }]"
      >
        <a-input v-model:value="formState.verificationCode" />
      </a-form-item>

      <a-form-item>
        <a-button
          :disabled="disabled"
          type="primary"
          html-type="submit"
          class="register-form-button"
        >
          注册
        </a-button>
        Or
        <a href="/Login">已有账号？点击登录</a>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { UserOutlined, LockOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
interface FormState {
  username: string;
  password: string;
  verificationCode: string;
}

const formState = reactive<FormState>({
  username: "",
  password: "",
  verificationCode: "",
});

const onFinish = async () => {
  try {
    const response = await axios.post("/api/user/register", {
      username: formState.username,
      password: formState.password,
    });
    if (response.data === "注册成功") {
      message.success("注册成功");
      router.push("/Login");
    } else {
      message.error(response.data);
    }
  } catch (error) {
    message.error("注册失败，查看网络连接");
  }
};

const onFinishFailed = (errorInfo: any) => {
  console.log("Failed:", errorInfo);
};

const disabled = computed(() => {
  return !(
    formState.username &&
    formState.password &&
    formState.verificationCode
  );
});

const router = useRouter();
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.register-form {
  max-width: 300px;
  width: 100%;
}

.register-form-button {
  width: 100%;
}
</style>
