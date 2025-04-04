<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import axios from "axios";

// 用户列表数据
const userList = ref([]);
// 分页相关
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
// 正在编辑的用户ID列表
const editableIds = ref([]);
// 缓存原始数据
const originalDataCache = new Map();

// 获取用户数据
const fetchUsers = async () => {
  try {
    const response = await axios.get("/api/user/getuser", {
      params: {
        pageNum: currentPage.value,
        pageSize: pageSize.value,
      },
    });
    const result = response.data;
    userList.value = result.users;
    total.value = result.total;

    // 保持页码不超过最大页数
    if (currentPage.value > result.pages && result.pages > 0) {
      currentPage.value = result.pages;
      await fetchUsers();
    }
  } catch (error) {
    console.error("获取用户数据失败:", error);
    ElMessage.error("获取用户数据失败");
  }
};

// 分页变化处理
const handlePageChange = (newPage) => {
  currentPage.value = newPage;
  fetchUsers();
};

// 每页数量变化处理
const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1; // 切换分页大小时重置到第一页
  fetchUsers();
};

// 开始编辑
const startEdit = (row) => {
  originalDataCache.set(row.id, { ...row });
  editableIds.value.push(row.id);
};

// 取消编辑
const cancelEdit = (row) => {
  const originalData = originalDataCache.get(row.id);
  Object.assign(row, originalData);
  editableIds.value = editableIds.value.filter((id) => id !== row.id);
  originalDataCache.delete(row.id);
};

// 保存修改
const handleSave = async (row) => {
  try {
    // 使用axios发送表单数据
    const response = await axios.post("/api/user/update", null, {
      params: {
        id: row.id,
        username: row.username,
        password: row.password,
        role: row.role,
      },
    });

    if (response.status === 200) {
      ElMessage.success("修改成功");
      editableIds.value = editableIds.value.filter((id) => id !== row.id);
      originalDataCache.delete(row.id);
    }
  } catch (err) {
    console.error("保存失败:", err);
    const errorMsg = err.response?.data || err.message || "未知错误";
    ElMessage.error(`保存失败: ${errorMsg}`);
    cancelEdit(row);
  }
};

// 初始化时获取数据
onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <!--  <div class="user-management">-->

  <!--  </div>-->
  <div class="table-container">
    <el-table
      :data="userList"
      border
      style="width: 100%"
      height="75vh"
      class="el-table"
    >
      <!-- 用户ID列 -->
      <el-table-column prop="id" label="ID" width="80" />

      <!-- 用户名列（可编辑） -->
      <el-table-column prop="username" label="用户名">
        <template #default="{ row }">
          <el-input
            v-if="editableIds.includes(row.id)"
            v-model="row.username"
          />
          <span v-else>{{ row.username }}</span>
        </template>
      </el-table-column>

      <!-- 密码列（可编辑） -->
      <el-table-column prop="password" label="密码">
        <template #default="{ row }">
          <el-input
            v-if="editableIds.includes(row.id)"
            v-model="row.password"
            type="password"
            show-password
          />
          <span v-else>{{ row.password.replace(/./g, "*") }}</span>
        </template>
      </el-table-column>

      <!-- 角色列（可编辑） -->
      <el-table-column prop="role" label="角色">
        <template #default="{ row }">
          <el-select v-if="editableIds.includes(row.id)" v-model="row.role">
            <el-option label="用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
          <el-tag v-else :type="row.role === 'admin' ? 'success' : ''">
            {{ row.role === "admin" ? "管理员" : "普通用户" }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <div v-if="editableIds.includes(row.id)">
            <el-button type="success" size="small" @click="handleSave(row)">
              保存
            </el-button>
            <el-button size="small" @click="cancelEdit(row)"> 取消 </el-button>
          </div>
          <div v-else>
            <el-button type="primary" size="small" @click="startEdit(row)">
              编辑
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <div class="pagination-container">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<style scoped>
.user-management {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px; /* Add padding here instead */
}
.pagination-container {
  margin-top: 16px;
  margin-bottom: 0;
  display: flex;
  justify-content: flex-end;
  background: white;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.table-container {
  height: 100%;
  flex: 1; /* 新增 */
  display: flex;
  flex-direction: column;
  min-height: 0; /* 修复flex容器滚动问题 */
}

.el-table {
  flex: 1; /* 自动填充剩余空间 */
  margin-bottom: 16px;
}
/* 调整表格样式 */
:deep(.el-table) {
  flex: 1;
  margin-bottom: 16px;
}

.pagination-container {
  flex-shrink: 0; /* 防止分页被压缩 */
}
</style>
