<template>
  <div class="chat-container">
    <!-- 左侧对话列表 -->
    <div class="conversations-list">
      <div class="conversations-header">
        <h3>对话列表</h3>
        <button
          @click="createNewChat"
          class="new-chat-btn"
          :disabled="loading.conversations || loading.sending"
        >
          新建对话
        </button>
      </div>
      <div class="conversations-content">
        <div v-if="loading.conversations" class="loading-container">
          <div class="loading-spinner"></div>
          <span>加载对话列表中...</span>
        </div>
        <template v-else>
          <div
            v-for="conv in conversations"
            :key="conv.id"
            @click="switchConversation(conv)"
            :class="[
              'conversation-item',
              { active: currentConversation?.id === conv.id },
            ]"
          >
            <div class="conversation-title">{{ conv.title || "新对话" }}</div>
            <div class="conversation-time">
              {{ formatTime(conv.updateTime, "yyyy-MM-dd HH:mm") }}
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 右侧聊天区域 -->
    <div class="chat-main">
      <!-- 对话内容为空时显示提示 -->
      <div v-if="!currentConversation" class="empty-conversation">
        请点击左侧对话列表开始聊天
      </div>
      <template v-else>
        <div class="chat-messages" ref="messageContainer">
          <div v-if="loading.messages" class="loading-container">
            <div class="loading-spinner"></div>
            <span>加载消息中...</span>
          </div>
          <template v-else>
            <div
              v-for="(message, index) in messages"
              :key="index"
              :class="['message', message.role]"
            >
              <!-- 显示头像 -->
              <img
                v-if="message.role === 'user'"
                :src="store.image"
                alt="用户头像"
                class="avatar"
              />
              <img
                v-else
                src="../assets/img/logo.jpg"
                alt="助手头像"
                class="avatar"
              />
              <!-- 气泡对话框 -->
              <div
                class="bubble"
                v-html="renderMarkdown(message.content)"
              ></div>
              <div class="message-time">
                {{ formatTime(message.createTime, "HH:mm") }}
              </div>
            </div>
          </template>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input">
          <textarea
            v-model="inputMessage"
            @keyup.enter.exact="sendMessage"
            placeholder="输入消息，按Enter发送..."
            rows="3"
            :disabled="loading.sending"
          ></textarea>
          <button
            @click="sendMessage"
            :disabled="!inputMessage.trim() || loading.sending"
          >
            {{ loading.sending ? "发送中..." : "发送" }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
import axios from "axios";
import { store } from "../store";
import { marked } from "marked";

// 状态管理
const conversations = ref([]);
const messages = ref([]);
const currentConversation = ref(null);
const inputMessage = ref("");
const messageContainer = ref(null);
const userId = store.userId;

// 加载状态管理
const loading = ref({
  conversations: false,
  messages: false,
  sending: false,
});

// 获取对话列表
const fetchConversations = async () => {
  loading.value.conversations = true;
  try {
    const response = await axios.get(
      `/api/chat/conversations?userId=${userId}`,
    );
    conversations.value = response.data.sort(
      (a, b) => new Date(a.updateTime) - new Date(b.updateTime),
    );
    // 默认展示最近一次对话内容
    if (response.data.length > 0) {
      currentConversation.value = response.data[0];
      await fetchMessages(currentConversation.value.id);
      scrollToBottom();
    }
  } catch (error) {
    console.error("获取对话列表失败:", error);
  } finally {
    loading.value.conversations = false;
  }
};

const formatTime = (timeString, format = "yyyy-MM-dd HH:mm:ss") => {
  if (!timeString) return "";
  const date = new Date(timeString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 月份从 0 开始
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return format
    .replace(/yyyy/g, year)
    .replace(/MM/g, month.toString().padStart(2, "0"))
    .replace(/dd/g, day.toString().padStart(2, "0"))
    .replace(/HH/g, hour.toString().padStart(2, "0"))
    .replace(/mm/g, minute.toString().padStart(2, "0"))
    .replace(/ss/g, second.toString().padStart(2, "0"));
};

// 获取特定对话的消息
const fetchMessages = async (conversationId) => {
  loading.value.messages = true;
  try {
    const response = await axios.get(
      `/api/chat/messages?conversationId=${conversationId}`,
    );
    messages.value = response.data;
    await scrollToBottom();
  } catch (error) {
    console.error("获取消息失败:", error);
  } finally {
    loading.value.messages = false;
  }
};

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || loading.value.sending) return;

  loading.value.sending = true;
  try {
    const response = await axios.post("/api/chat/sendMessage", null, {
      params: {
        userId,
        message: inputMessage.value,
        conversationId: currentConversation.value?.id,
      },
    });

    if (response.data.success) {
      if (!currentConversation.value) {
        await fetchConversations();
      } else {
        // 添加发送的消息到列表中
        messages.value.push({
          role: "user",
          content: inputMessage.value,
          createTime: new Date().toISOString(),
        });
        await fetchMessages(currentConversation.value.id);
      }
      inputMessage.value = "";
      await scrollToBottom();
    } else {
      alert(response.data.errorMessage || "发送失败");
    }
  } catch (error) {
    console.error("发送消息失败:", error);
    alert("发送消息失败");
  } finally {
    loading.value.sending = false;
  }
};

// 切换对话
const switchConversation = async (conversation) => {
  if (loading.value.messages || loading.value.sending) return;
  currentConversation.value = conversation;
  await fetchMessages(conversation.id);
  scrollToBottom();
};

// 创建新对话
const createNewChat = async () => {
  if (loading.value.conversations || loading.value.sending) return;

  // 弹出输入问题页面
  const question = prompt("请输入问题");
  if (question) {
    loading.value.sending = true;
    try {
      // 调用后端接口发送消息并创建新对话
      const response = await axios.post("/api/chat/sendMessage", null, {
        params: {
          userId,
          message: question,
        },
      });

      if (response.data.success) {
        // 更新对话列表
        await fetchConversations();
        // 切换到新创建的对话
        const newConversation = conversations.value.find(
          (conv) => conv.title === question.substring(0, 20) + "...",
        );
        if (newConversation) {
          currentConversation.value = newConversation;
          await fetchMessages(newConversation.id);
        }
      } else {
        alert(response.data.errorMessage || "创建对话失败");
      }
    } catch (error) {
      console.error("创建新对话失败:", error);
      alert("创建新对话失败");
    } finally {
      loading.value.sending = false;
    }
  }
};

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick();
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
};

// 监听消息变化，自动滚动到底部
watch(messages, scrollToBottom);

// 组件挂载时获取对话列表
onMounted(fetchConversations);

// 解析Markdown
const renderMarkdown = (content) => {
  return marked(content);
};
</script>

<style scoped>
.chat-container {
  display: flex;
  height: calc(100vh - 66px); /* 减去导航栏的高度 */
  background-color: #f5f5f5;
}

.conversations-list {
  width: 300px;
  border-right: 1px solid #e0e0e0;
  background-color: white;
  display: flex;
  flex-direction: column;
}

.conversations-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.new-chat-btn {
  width: 100%;
  padding: 8px;
  margin-top: 10px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.new-chat-btn:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

.conversations-content {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  padding: 15px 20px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.conversation-item:hover {
  background-color: #f5f5f5;
}

.conversation-item.active {
  background-color: #e6f7ff;
}

.conversation-title {
  font-weight: 500;
  margin-bottom: 5px;
}

.conversation-time {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  text-align: right;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.empty-conversation {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 16px;
  color: #666;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message {
  display: flex;
  align-items: flex-end;
  max-width: 80%;
}

.message.user {
  flex-direction: row-reverse;
}

.message.assistant {
  flex-direction: row;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.avatar.user {
  margin-right: 0;
  margin-left: 10px;
}

.bubble {
  padding: 12px 16px;
  border-radius: 8px;
  max-width: 70%;
  word-wrap: break-word;
  background-color: #e6f7ff;
}

.bubble.user {
  background-color: #1890ff;
  color: white;
}

.bubble.assistant {
  background-color: white;
  border: 1px solid #d9d9d9;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  text-align: right;
}

.chat-input {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.chat-input textarea {
  flex: 1;
  padding: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  resize: none;
}

.chat-input textarea:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.chat-input button {
  padding: 0 20px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  min-width: 80px;
}

.chat-input button:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #666;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
