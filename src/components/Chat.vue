<template>
  <div class="chat-container">
    <!-- 左侧对话列表 -->
    <div class="conversations-list">
      <div class="conversations-header">
        <h3>对话列表</h3>
        <el-button
          type="primary"
          @click="createNewChat"
          :loading="loading.conversations || loading.sending"
          class="new-chat-btn"
        >
          <el-icon><Plus /></el-icon>新建对话
        </el-button>
      </div>
      <div class="conversations-content">
        <el-skeleton :loading="loading.conversations" :rows="3" animated>
          <template #default>
            <div
              v-for="conv in conversations"
              :key="conv.id"
              @click="switchConversation(conv)"
              :class="[
                'conversation-item',
                { active: currentConversation?.id === conv.id },
              ]"
            >
              <div class="conversation-header">
                <el-tooltip
                  :content="conv.title || '新对话'"
                  placement="top"
                  :show-after="1000"
                >
                  <div class="conversation-title">
                    {{ conv.title || "新对话" }}
                  </div>
                </el-tooltip>
                <el-button
                  v-if="currentConversation?.id === conv.id"
                  type="primary"
                  link
                  @click.stop="handleEditTitle(conv)"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
              </div>
              <div class="conversation-time">
                {{ formatTime(conv.updateTime, "yyyy-MM-dd HH:mm") }}
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>
    </div>

    <!-- 右侧聊天区域 -->
    <div class="chat-main">
      <div v-if="!currentConversation" class="empty-conversation">
        选择一个对话或开始新对话
      </div>

      <template v-else>
        <!-- 消息列表 -->
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
              <img
                :class="['avatar', message.role]"
                :src="
                  message.role === 'user'
                    ? store.image
                    : '/src/assets/img/logo.png'
                "
                :alt="message.role"
              />
              <div>
                <div
                  :class="['bubble', message.role]"
                  v-html="renderMarkdown(message.content)"
                ></div>
                <div class="message-time">
                  {{ formatTime(message.createTime) }}
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input">
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="3"
            placeholder="输入消息..."
            :disabled="loading.sending"
            @keyup.enter.exact="sendMessage"
          />
          <div class="input-actions">
            <el-button
              type="primary"
              @click="sendMessage"
              :loading="loading.sending"
              :disabled="!inputMessage.trim()"
            >
              发送
            </el-button>
          </div>
        </div>
      </template>
    </div>

    <!-- 编辑标题对话框 -->
    <el-dialog
      v-model="editTitleDialog.visible"
      title="修改对话标题"
      width="30%"
      :close-on-click-modal="false"
    >
      <el-input
        v-model="editTitleDialog.title"
        placeholder="请输入新标题"
        maxlength="50"
        show-word-limit
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editTitleDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="updateConversationTitle">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
import axios from "axios";
import { store } from "../store";
import { marked } from "marked";
import { ElMessage } from "element-plus";
import { Plus, Edit } from "@element-plus/icons-vue";

// 状态管理
const conversations = ref([]);
const messages = ref([]);
const currentConversation = ref(null);
const inputMessage = ref("");
const messageContainer = ref(null);
const userId = store.userId;
// 新增编辑标题相关状态
const editTitleDialog = ref({
  visible: false,
  title: "",
  conversationId: null,
});
// 加载状态管理
const loading = ref({
  conversations: false,
  messages: false,
  sending: false,
});

// 处理编辑标题
const handleEditTitle = (conversation) => {
  editTitleDialog.value = {
    visible: true,
    title: conversation.title,
    conversationId: conversation.id,
  };
};

// 更新对话标题
const updateConversationTitle = async () => {
  try {
    const response = await axios.get("/api/chat/updateConversationTitle", {
      params: {
        userId: store.userId,
        conversationId: editTitleDialog.value.conversationId,
        title: editTitleDialog.value.title,
      },
    });
    conversations.value = response.data;
    editTitleDialog.value.visible = false;
    ElMessage.success("标题更新成功");
  } catch (error) {
    ElMessage.error("标题更新失败");
  }
};

// 获取对话列表
const fetchConversations = async () => {
  loading.value.conversations = true;
  try {
    const response = await axios.get(
      `/api/chat/conversations?userId=${userId}`,
    );
    // conversations.value = response.data.sort(
    //   (a, b) => new Date(a.updateTime) - new Date(b.updateTime),
    // );
    conversations.value = response.data;
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
    console.log(messages);
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
  await scrollToBottom();
};

// 创建新对话
const createNewChat = async () => {
  if (loading.value.conversations || loading.value.sending) return;

  const question = prompt("请输入问题");
  if (question) {
    loading.value.sending = true;
    try {
      const response = await axios.post("/api/chat/sendMessage", null, {
        params: {
          userId,
          message: question,
        },
      });

      if (response.data.success) {
        await fetchConversations();
        // 修改这里的查找逻辑
        const newConversation =
          conversations.value[conversations.value.length - 1];
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
  height: calc(100vh - 66px);
  background-color: #f0f2f5;
}

.conversations-list {
  width: 320px;
  border-right: 1px solid #e8e8e8;
  background-color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.conversations-header {
  padding: 20px;
  border-bottom: 1px solid #e8e8e8;
  background-color: #fafafa;
}

.conversations-header h3 {
  margin: 0;
  color: #1f2937;
}

.new-chat-btn {
  width: 100%;
  margin-top: 12px;
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
  padding: 16px 20px;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f0f0f0;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.conversation-item:hover {
  background-color: #f9fafb;
}

.conversation-title {
  font-weight: 500;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.conversation-time {
  font-size: 12px;
  color: #6b7280;
  margin-top: 8px;
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

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f9f9fb;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24px;
  max-width: 90%;
}

.message.user {
  margin-left: auto;
  flex-direction: row-reverse;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border: 2px solid white;
}

.avatar.user {
  background-color: #e6f7ff;
}

.bubble {
  padding: 14px 18px;
  border-radius: 18px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  line-height: 1.6;
  position: relative;
  max-width: 100%;
}

.bubble.user {
  background-color: #1890ff;
  color: white;
  border-top-right-radius: 2px;
}

.bubble.assistant {
  background-color: white;
  color: #333;
  border-top-left-radius: 2px;
}

.bubble.user:after {
  content: "";
  position: absolute;
  right: -8px;
  top: 15px;
  border: 8px solid transparent;
  border-left-color: #1890ff;
  border-right: 0;
}

.bubble.assistant:after {
  content: "";
  position: absolute;
  left: -8px;
  top: 15px;
  border: 8px solid transparent;
  border-right-color: white;
  border-left: 0;
}

/* 美化 Markdown 内容 */
.bubble :deep(pre) {
  background-color: rgba(0, 0, 0, 0.04);
  padding: 16px;
  border-radius: 8px;
  margin: 12px 0;
  overflow-x: auto;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.bubble.user :deep(pre) {
  background-color: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
}

.bubble :deep(code) {
  font-family: "Fira Code", "Source Code Pro", Consolas, monospace;
  padding: 2px 5px;
  font-size: 0.9em;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.05);
}

.bubble.user :deep(code) {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.bubble :deep(p) {
  margin: 0 0 10px 0;
  line-height: 1.6;
}

.bubble :deep(p:last-child) {
  margin-bottom: 0;
}

.bubble :deep(ul),
.bubble :deep(ol) {
  margin: 10px 0;
  padding-left: 20px;
}

.bubble :deep(li) {
  margin-bottom: 5px;
}

.bubble :deep(a) {
  color: #1890ff;
  text-decoration: none;
}

.bubble.user :deep(a) {
  color: #e6f7ff;
  text-decoration: underline;
}

.bubble :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
}

.bubble :deep(th),
.bubble :deep(td) {
  border: 1px solid #eee;
  padding: 8px 12px;
  text-align: left;
}

.bubble.user :deep(th),
.bubble.user :deep(td) {
  border-color: rgba(255, 255, 255, 0.2);
}

.bubble :deep(th) {
  background-color: rgba(0, 0, 0, 0.05);
}

.bubble.user :deep(th) {
  background-color: rgba(255, 255, 255, 0.1);
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 6px;
  text-align: right;
  opacity: 0.8;
}

.message.user .message-time {
  text-align: left;
  color: #999; /* 与助手消息时间相同的颜色 */
  opacity: 0.8;
}

.chat-input {
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.chat-input textarea {
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.chat-input textarea:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.chat-input textarea:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
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

/* 优化空状态样式 */
.empty-conversation {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 16px;
  color: #666;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 40px;
}

.empty-conversation:before {
  content: "💬";
  font-size: 48px;
  margin-bottom: 16px;
}

/* 消息加载动画 */
@keyframes messageIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
