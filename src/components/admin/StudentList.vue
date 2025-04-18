<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import axios from "axios";

// 数据列表
const studentList = ref([]);
// 分页相关
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
// 学院和班级选项
const academies = ref([]);
const classes = ref([]);
// 搜索条件
const searchForm = ref({
  academy: "",
  className: "",
  studentId: "",
  studentName: "",
});
// 加载状态
const loading = ref(false);

// 获取学院列表
const fetchAcademies = async () => {
  try {
    const response = await axios.get("/api/student/academies");
    academies.value = response.data;
  } catch (error) {
    console.error("获取学院列表失败:", error);
    ElMessage.error("获取学院列表失败");
  }
};

// 根据学院获取班级列表
const fetchClasses = async () => {
  if (!searchForm.value.academy) {
    classes.value = [];
    searchForm.value.className = "";
    return;
  }

  try {
    const response = await axios.get("/api/student/classes", {
      params: { academy: searchForm.value.academy },
    });
    classes.value = response.data;
  } catch (error) {
    console.error("获取班级列表失败:", error);
    ElMessage.error("获取班级列表失败");
  }
};

// 监听学院变化
const handleAcademyChange = () => {
  fetchClasses();
};

// 获取学生数据
const fetchStudents = async () => {
  loading.value = true;
  try {
    const response = await axios.get("/api/student/list", {
      params: {
        pageNum: currentPage.value,
        pageSize: pageSize.value,
        academy: searchForm.value.academy || undefined,
        className: searchForm.value.className || undefined,
        studentId: searchForm.value.studentId || undefined,
        studentName: searchForm.value.studentName || undefined,
      },
    });
    const result = response.data;
    studentList.value = result.students;
    total.value = result.total;

    if (currentPage.value > result.pages && result.pages > 0) {
      currentPage.value = result.pages;
      await fetchStudents();
    }
  } catch (error) {
    console.error("获取学生数据失败:", error);
    ElMessage.error("获取学生数据失败");
  } finally {
    loading.value = false;
  }
};

// 分页变化处理
const handlePageChange = (newPage) => {
  currentPage.value = newPage;
  fetchStudents();
};

const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1;
  fetchStudents();
};

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1;
  fetchStudents();
};

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    academy: "",
    className: "",
    studentId: "",
    studentName: "",
  };
  classes.value = [];
  handleSearch();
};

// 下载Excel
const downloadExcel = async () => {
  try {
    const confirmResult = await ElMessageBox.confirm(
      "确定要下载当前筛选条件下的所有学生数据吗？",
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info",
      },
    );

    if (confirmResult) {
      const params = new URLSearchParams({
        academy: searchForm.value.academy || "",
        className: searchForm.value.className || "",
        studentId: searchForm.value.studentId || "",
        studentName: searchForm.value.studentName || "",
      });

      // 使用window.open下载文件
      window.open(`/api/student/export?${params.toString()}`, "_blank");
      ElMessage.success("下载请求已发送");
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("下载Excel失败:", error);
      ElMessage.error("下载Excel失败");
    }
  }
};

onMounted(() => {
  fetchAcademies();
  fetchStudents();
});
</script>

<template>
  <div class="student-management">
    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="学院">
          <el-select
            v-model="searchForm.academy"
            placeholder="请选择学院"
            clearable
            @change="handleAcademyChange"
          >
            <el-option
              v-for="academy in academies"
              :key="academy"
              :label="academy"
              :value="academy"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select
            v-model="searchForm.className"
            placeholder="请选择班级"
            clearable
            :disabled="!searchForm.academy"
          >
            <el-option
              v-for="className in classes"
              :key="className"
              :label="className"
              :value="className"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="学号">
          <el-input v-model="searchForm.studentId" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="searchForm.studentName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="downloadExcel">下载Excel</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="studentList"
        border
        style="width: 100%"
        height="calc(100vh - 280px)"
      >
        <el-table-column prop="id" label="学号" width="120" />
        <el-table-column prop="studentName" label="姓名" width="100" />
        <el-table-column prop="academy" label="学院" width="150" />
        <el-table-column prop="className" label="班级" width="150" />
        <el-table-column prop="deyu" label="德育" width="80" />
        <el-table-column prop="zhiyu" label="智育" width="80" />
        <el-table-column prop="meiyu" label="美育" width="80" />
        <el-table-column prop="tiyu" label="体育" width="80" />
        <el-table-column prop="xiaoyuan" label="校园" width="80" />
        <el-table-column prop="xiangtu" label="乡土" width="80" />
        <el-table-column prop="chanxue" label="产学" width="80" />
        <el-table-column prop="jiating" label="家庭" width="80" />
        <el-table-column prop="qingshi" label="寝室" width="80" />
        <el-table-column prop="volunteerTime" label="志愿时长" width="100" />
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
.student-management {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  background-color: #f5f7fa;
}

.search-card {
  margin-bottom: 0;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.search-card :deep(.el-card__body) {
  padding: 20px;
}

.table-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.table-card :deep(.el-card__body) {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.table-card :deep(.el-table) {
  flex: 1;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}

.table-card :deep(.el-table th) {
  background-color: #f0f5ff;
  color: #1e293b;
  font-weight: 600;
}

.table-card :deep(.el-table td, .el-table th) {
  padding: 12px 0;
}

.table-card
  :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #fafafa;
}

.table-card :deep(.el-table__row:hover td) {
  background-color: #ecf5ff !important;
}

.pagination-container {
  margin: 0;
  padding: 16px 20px;
  display: flex;
  justify-content: flex-end;
  background-color: #fff;
  border-radius: 0 0 8px 8px;
  border-top: 1px solid #ebeef5;
}

/* 表单元素样式优化 */
.search-card :deep(.el-input__wrapper),
.search-card :deep(.el-select .el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  transition: all 0.2s;
}

.search-card :deep(.el-input__wrapper:hover),
.search-card :deep(.el-select .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #a0cfff inset;
}

.search-card :deep(.el-input__wrapper.is-focus),
.search-card :deep(.el-select .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

/* 按钮样式优化 */
.search-card :deep(.el-button) {
  border-radius: 4px;
  padding: 8px 16px;
  transition: all 0.3s;
}

.search-card :deep(.el-button--primary) {
  background-color: #409eff;
}

.search-card :deep(.el-button--primary:hover) {
  background-color: #66b1ff;
}

.search-card :deep(.el-button--success) {
  background-color: #67c23a;
}

.search-card :deep(.el-button--success:hover) {
  background-color: #85ce61;
}

/* 表头固定 */
.table-card :deep(.el-table__header-wrapper) {
  position: sticky;
  top: 0;
  z-index: 2;
}

/* 表格单元格内容垂直居中 */
.table-card :deep(.el-table .cell) {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 表格数字列右对齐 */
.table-card :deep(.el-table-column--numeric .cell) {
  justify-content: flex-end;
}

/* 学号列左对齐 */
.table-card :deep(.el-table-column--id .cell) {
  justify-content: flex-start;
}

/* 学院、班级、姓名列左对齐 */
.table-card :deep(.el-table-column--academy .cell),
.table-card :deep(.el-table-column--className .cell),
.table-card :deep(.el-table-column--studentName .cell) {
  justify-content: flex-start;
}

/* 页面标题 */
.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}
</style>
