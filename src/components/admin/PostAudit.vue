<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import type { Post } from "../../types/post.ts";
import axios from "axios";
// 定义分页参数
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const loading = ref(false);
const postList = ref<Post[]>([]);

// 获取标签类型
const getTagType = (status: number) => {
  switch (status) {
    case 1:
      return "green";
    case 2:
      return "blue";
    case 3:
      return "purple";
    case 4:
      return "orange";
    default:
      return "red";
  }
};

// 获取待审核的贴子列表
const getPendingPosts = async () => {
  loading.value = true;
  try {
    const { data } = await axios.get("/api/post/admin/allow", {
      params: {
        page: currentPage.value,
        size: pageSize.value,
      },
    });
    postList.value = data.records;
    total.value = data.total;
  } catch (error) {
    console.error("获取待审核贴子失败:", error);
    ElMessage.error("获取待审核贴子失败");
  } finally {
    loading.value = false;
  }
};

// 审核贴子
const reviewPost = async (row: Post, allow: number) => {
  try {
    await axios.put(`/api/post/admin/${row.id}/allow`, { allow });
    ElMessage.success(allow === 1 ? "审核通过" : "审核拒绝");
    await getPendingPosts();
  } catch (error) {
    console.error("审核操作失败:", error);
    ElMessage.error("审核操作失败");
  }
};

// 处理页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page;
  getPendingPosts();
};

// 处理每页条数变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  getPendingPosts();
};

onMounted(() => {
  getPendingPosts();
});
</script>

<template>
  <div class="review-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="title">待审核贴子</span>
          <span class="count">共 {{ total }} 条</span>
        </div>
      </template>

      <el-table v-loading="loading" :data="postList" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column
          prop="title"
          label="标题"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTagType(row.status)">
              {{
                row.status === 1
                  ? "闲置"
                  : row.status === 2
                    ? "求助"
                    : row.status === 3
                      ? "搭子"
                      : "趣事"
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="userId" label="发帖人ID" width="100" />
        <el-table-column prop="createdAt" label="发帖时间" width="180" />
        <el-table-column label="预览内容" show-overflow-tooltip>
          <template #default="{ row }">
            <div v-html="row.content.substring(0, 100) + '...'" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="$router.push(`/admin/posts/${row.id}`)"
            >
              详情
            </el-button>
            <el-button type="success" link @click="reviewPost(row, 1)">
              通过
            </el-button>
            <el-button type="danger" link @click="reviewPost(row, -1)">
              拒绝
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
.review-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.count {
  color: #909399;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
