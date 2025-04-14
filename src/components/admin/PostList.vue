<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { Post } from "../../types/post.ts";
import axios from "axios";

// 定义分页参数
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const loading = ref(false);
const postList = ref<Post[]>([]);

// 搜索条件
const searchForm = ref({
  title: "",
  status: "",
  allow: "",
});

// 状态选项（贴子类型）
const statusOptions = [
  { label: "全部", value: "" },
  { label: "公告", value: 0 },
  { label: "闲置", value: 1 },
  { label: "求组", value: 2 },
  { label: "搭子", value: 3 },
  { label: "趣事", value: 4 },
];

// 审核状态选项
const allowOptions = [
  { label: "全部", value: "" },
  { label: "已通过", value: 1 },
  { label: "待审核", value: 0 },
  { label: "已拒绝", value: -1 },
];

// 获取帖子列表
const getPostList = async () => {
  loading.value = true;
  try {
    const { data } = await axios.get("/api/post/admin/posts", {
      params: {
        page: currentPage.value,
        size: pageSize.value,
        title: searchForm.value.title,
        status: searchForm.value.status,
        allow: searchForm.value.allow,
      },
    });
    postList.value = data.records;
    total.value = data.total;
  } catch (error) {
    console.error("获取帖子列表失败:", error);
    ElMessage.error("获取帖子列表失败");
  } finally {
    loading.value = false;
  }
};

// 获取类型标签样式
const getTagType = (status: number) => {
  switch (status) {
    case 0:
      return "danger"; // 公告 - 红色
    case 1:
      return "info"; // 闲置 - 灰色
    case 2:
      return "warning"; // 求组 - 黄色
    case 3:
      return "success"; // 搭子 - 绿色
    case 4:
      return "primary"; // 趣事 - 蓝色
    default:
      return "info";
  }
};

// 获取审核按钮类型
const getAllowButtonType = (allow: number) => {
  switch (allow) {
    case 0:
      return "success"; // 待审核 -> 显示通过按钮
    case 1:
      return "danger"; // 已通过 -> 显示拒绝按钮
    case -1:
      return "warning"; // 已拒绝 -> 显示重审按钮
    default:
      return "primary";
  }
};

// 获取审核按钮文本
const getAllowButtonText = (allow: number) => {
  switch (allow) {
    case 0:
      return "通过";
    case 1:
      return "拒绝";
    case -1:
      return "重审";
    default:
      return "审核";
  }
};

// 修改审核状态
const changeAllow = async (row: Post) => {
  let newAllow: number;
  if (row.allow === 0) {
    newAllow = 1; // 待审核 -> 通过
  } else if (row.allow === 1) {
    newAllow = -1; // 已通过 -> 拒绝
  } else {
    newAllow = 0; // 已拒绝 -> 待审核
  }

  try {
    await axios.put(`/api/post/admin/posts/${row.id}/allow`, {
      allow: newAllow,
    });
    ElMessage.success("审核状态更新成功");
    await getPostList();
  } catch (error) {
    console.error("更新审核状态失败:", error);
    ElMessage.error("更新审核状态失败");
  }
};

// 处理页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page;
  getPostList();
};

// 处理每页条数变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  getPostList();
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1;
  getPostList();
};

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    title: "",
    status: "",
    allow: "",
  };
  handleSearch();
};

// 删除帖子
const handleDelete = (row: Post) => {
  ElMessageBox.confirm("确认删除该帖子吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      await axios.delete(`/api/post/admin/posts/${row.id}`);
      ElMessage.success("删除成功");
      await getPostList();
    } catch (error) {
      console.error("删除失败:", error);
      ElMessage.error("删除失败");
    }
  });
};

onMounted(() => {
  getPostList();
});
</script>

<template>
  <div class="post-list">
    <el-card class="filter-card">
      <div class="filter-container">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="标题">
            <el-input
              v-model="searchForm.title"
              placeholder="请输入标题关键词"
              clearable
              style="width: 220px"
            />
          </el-form-item>
          <el-form-item label="类型">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择类型"
              clearable
              style="width: 160px"
            >
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="审核状态">
            <el-select
              v-model="searchForm.allow"
              placeholder="请选择审核状态"
              clearable
              style="width: 160px"
            >
              <el-option
                v-for="item in allowOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card class="list-card">
      <el-table v-loading="loading" :data="postList" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column
          prop="title"
          label="标题"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column prop="userId" label="作者ID" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column prop="starsCount" label="点赞数" width="80" />
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTagType(row.status)">
              {{
                row.status === 0
                  ? "公告"
                  : row.status === 1
                    ? "闲置"
                    : row.status === 2
                      ? "求组"
                      : row.status === 3
                        ? "搭子"
                        : "趣事"
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" width="120">
          <template #default="{ row }">
            <el-tag
              :type="
                row.allow === 1
                  ? 'success'
                  : row.allow === 0
                    ? 'warning'
                    : 'danger'
              "
            >
              {{
                row.allow === 1
                  ? "已通过"
                  : row.allow === 0
                    ? "待审核"
                    : "已拒绝"
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="$router.push(`/admin/posts/${row.id}`)"
            >
              查看
            </el-button>
            <el-button
              :type="getAllowButtonType(row.allow)"
              link
              @click="changeAllow(row)"
            >
              {{ getAllowButtonText(row.allow) }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.post-list {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-container {
  width: 100%;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}

.list-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
