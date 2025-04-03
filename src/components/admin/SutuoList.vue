<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import axios from "axios";

// 数据列表
const sutuoList = ref([]);
// 分页相关
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
// 正在编辑的记录ID列表
const editableIds = ref([]);
// 缓存原始数据
const originalDataCache = new Map();
// 搜索条件
const searchForm = ref({
  studentId: "",
  activity: "",
});

// 获取数据
const fetchSutuos = async () => {
  try {
    const response = await axios.get("/api/sutuo/getsutuos", {
      params: {
        pageNum: currentPage.value,
        pageSize: pageSize.value,
        studentId: searchForm.value.studentId || undefined,
        activity: searchForm.value.activity || undefined,
      },
    });
    const result = response.data;
    sutuoList.value = result.sutuos;
    total.value = result.total;

    if (currentPage.value > result.pages && result.pages > 0) {
      currentPage.value = result.pages;
      await fetchSutuos();
    }
  } catch (error) {
    console.error("获取素拓数据失败:", error);
    ElMessage.error("获取素拓数据失败");
  }
};

// 分页变化处理
const handlePageChange = (newPage) => {
  currentPage.value = newPage;
  fetchSutuos();
};

const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1;
  fetchSutuos();
};

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1;
  fetchSutuos();
};

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    studentId: "",
    activity: "",
  };
  handleSearch();
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
    const response = await axios.post("/api/sutuo/update", row);
    if (response.status === 200) {
      ElMessage.success(response.data);
      editableIds.value = editableIds.value.filter((id) => id !== row.id);
      originalDataCache.delete(row.id);
    }
  } catch (err) {
    const errorMsg = err.response?.data || "未知错误";
    ElMessage.error(errorMsg);
    cancelEdit(row);
  }
};

const handleDelete = async (row) => {
  try {
    const result = await ElMessageBox.confirm(
      "确定要删除这条记录吗？",
      "警告",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      },
    );

    if (result) {
      const response = await axios.delete(`/api/sutuo/delete/${row.id}`);
      if (response.status === 200) {
        ElMessage.success(response.data);
        // 重新加载数据
        fetchSutuos();
      }
    }
  } catch (err) {
    if (err !== "cancel") {
      const errorMsg = err.response?.data || "未知错误";
      ElMessage.error(errorMsg);
    }
  }
};

onMounted(() => {
  fetchSutuos();
});
</script>

<template>
  <div class="sutuo-management">
    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="学号">
          <el-input v-model="searchForm.studentId" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="活动名称">
          <el-input
            v-model="searchForm.activity"
            placeholder="请输入活动名称"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table
        :data="sutuoList"
        border
        style="width: 100%"
        height="calc(100vh - 280px)"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="studentId" label="学号" width="120" />
        <el-table-column prop="activity" label="活动名称" min-width="150" />

        <el-table-column
          v-for="item in [
            { prop: 'deyu', label: '德育' },
            { prop: 'zhiyu', label: '智育' },
            { prop: 'meiyu', label: '美育' },
            { prop: 'tiyu', label: '体育' },
            { prop: 'xiaoyuan', label: '校园' },
            { prop: 'xiangtu', label: '乡土' },
            { prop: 'chanxue', label: '产学' },
            { prop: 'jiating', label: '家庭' },
            { prop: 'qingshi', label: '寝室' },
          ]"
          :key="item.prop"
          :label="item.label"
          width="100"
        >
          <template #default="{ row }">
            <el-input-number
              v-if="editableIds.includes(row.id)"
              v-model="row[item.prop]"
              :min="0"
              :max="100"
              size="small"
            />
            <span v-else>{{ row[item.prop] }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="volunteerTime" label="志愿时长" width="100">
          <template #default="{ row }">
            <el-input-number
              v-if="editableIds.includes(row.id)"
              v-model="row.volunteerTime"
              :min="0"
              :precision="1"
              :step="0.5"
              size="small"
            />
            <span v-else>{{ row.volunteerTime }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div v-if="editableIds.includes(row.id)">
              <el-button type="success" size="small" @click="handleSave(row)">
                保存
              </el-button>
              <el-button size="small" @click="cancelEdit(row)">
                取消
              </el-button>
            </div>
            <div v-else>
              <el-button type="primary" size="small" @click="startEdit(row)">
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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
    </el-card>
  </div>
</template>

<style scoped>
.sutuo-management {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.search-card {
  margin-bottom: 16px;
}

.table-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>
