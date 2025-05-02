<script lang="ts" setup>
import { reactive, computed, ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";

interface FormState {
  username: string;
  password: string;
  email: string;
  verificationCode: string;
}

const formState = reactive<FormState>({
  username: "",
  password: "",
  email: "",
  verificationCode: "",
});

const sendingCode = ref(false);
const countdown = ref(0);
const timer = ref<number | null>(null);

// 发送验证码
const sendVerificationCode = async () => {
  if (!formState.email) {
    message.error("请先输入邮箱地址");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
    message.error("请输入有效的邮箱地址");
    return;
  }

  try {
    sendingCode.value = true;
    const response = await axios.post("/api/user/sendVerificationCode", {
      email: formState.email,
    });

    if (response.data === "验证码发送成功") {
      message.success("验证码已发送到您的邮箱");
      countdown.value = 60;
      timer.value = window.setInterval(() => {
        if (countdown.value > 0) {
          countdown.value--;
        } else {
          if (timer.value) {
            clearInterval(timer.value);
            timer.value = null;
          }
        }
      }, 1000);
    } else {
      message.error(response.data || "发送验证码失败");
    }
  } catch (error) {
    message.error("发送验证码失败，请检查网络连接");
  } finally {
    sendingCode.value = false;
  }
};

const onFinish = async () => {
  try {
    const response = await axios.post("/api/user/register", {
      username: formState.username,
      password: formState.password,
      email: formState.email,
      verificationCode: formState.verificationCode,
    });

    if (response.data === "注册成功") {
      message.success("注册成功");
      router.push("/Login");
    } else {
      message.error(response.data);
    }
  } catch (error) {
    message.error("注册失败，请检查网络连接");
  }
};

const onFinishFailed = (errorInfo: any) => {
  console.log("Failed:", errorInfo);
};

const disabled = computed(() => {
  return !(
    formState.username &&
    formState.password &&
    formState.email &&
    formState.verificationCode
  );
});

const router = useRouter();
</script>

<template>
  <div class="register-container">
    <a-form
      :model="formState"
      name="register_form"
      class="register-form"
      @finish="onFinish"
      @finishFailed="onFinishFailed"
    >
      <h2 class="register-title">用户注册</h2>

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
        label="邮箱"
        name="email"
        :rules="[
          { required: true, message: '请输入你的邮箱！' },
          { type: 'email', message: '请输入有效的邮箱地址！' },
        ]"
      >
        <a-input v-model:value="formState.email">
          <template #prefix>
            <MailOutlined class="site-form-item-icon" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item
        label="验证码"
        name="verificationCode"
        :rules="[{ required: true, message: '请输入验证码！' }]"
      >
        <div class="verification-code-container">
          <a-input v-model:value="formState.verificationCode" />
          <a-button
            type="primary"
            :disabled="countdown > 0 || sendingCode"
            @click="sendVerificationCode"
            class="send-code-button"
          >
            {{ countdown > 0 ? `${countdown}秒后重新发送` : "获取验证码" }}
          </a-button>
        </div>
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
        <div class="login-link">已有账号？<a href="/Login">点击登录</a></div>
      </a-form-item>
    </a-form>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}

.register-form {
  max-width: 400px;
  width: 100%;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.register-title {
  text-align: center;
  margin-bottom: 24px;
  color: #1890ff;
  font-size: 24px;
}

.register-form-button {
  width: 100%;
  height: 40px;
  font-size: 16px;
}

.verification-code-container {
  display: flex;
  gap: 10px;
}

.verification-code-container .ant-input {
  flex: 1;
}

.send-code-button {
  white-space: nowrap;
}

.login-link {
  margin-top: 15px;
  text-align: center;
}

.site-form-item-icon {
  color: rgba(0, 0, 0, 0.25);
}
</style>
