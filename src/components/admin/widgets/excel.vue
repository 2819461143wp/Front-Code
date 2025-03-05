<template>
  <div class="excel-import-export">
    <!-- 导入模块 -->
    <el-card shadow="hover" class="mb-4">
      <template #header>
        <span>Excel 导入</span>
      </template>

      <el-upload
        :auto-upload="false"
        :show-file-list="false"
        :on-change="handleFileChange"
        accept=".xlsx, .xls"
      >
        <template #trigger>
          <el-button type="primary" :loading="importLoading"
            >选择 Excel 文件</el-button
          >
        </template>

        <el-button
          type="success"
          :disabled="!previewData.length || hasValidationErrors"
          @click="handleImport"
          :loading="importLoading"
        >
          确认导入
        </el-button>
      </el-upload>

      <!-- Sheet selection buttons -->
      <div v-if="sheetNames.length" class="mt-4">
        <el-button
          v-for="(sheet, index) in sheetNames"
          :key="index"
          @click="switchSheet(sheet)"
        >
          {{ sheet }}
        </el-button>
      </div>

      <!-- 数据预览 & 编辑 -->
      <div v-if="previewData.length" class="mt-4">
        <el-alert
          v-if="hasValidationErrors"
          type="error"
          show-icon
          class="mb-2"
        >
          存在 {{ validationErrors.length }} 条数据校验错误，请修正后再提交！
        </el-alert>

        <el-table :data="previewData" border height="400px">
          <el-table-column
            v-for="(header, index) in excelHeaders"
            :key="index"
            :prop="header"
            :label="header"
          >
            <template #default="{ row, $index }">
              <el-input
                v-model="row[header]"
                @change="validateRow(row, $index)"
                :class="{ 'error-cell': rowErrors[$index]?.includes(header) }"
              />
            </template>
          </el-table-column>

          <el-table-column label="错误信息" width="200">
            <template #default="{ $index }">
              <div v-if="rowErrors[$index]" class="error-messages">
                <el-tag
                  v-for="(error, i) in rowErrors[$index]"
                  :key="i"
                  type="danger"
                  size="small"
                >
                  {{ error }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 导出模块 -->
    <el-card shadow="hover">
      <template #header>
        <span>Excel 导出</span>
      </template>

      <el-button type="primary" @click="handleExport" :loading="exportLoading">
        导出当前数据
      </el-button>

      <el-button @click="fetchLatestData" :loading="exportLoading">
        获取最新数据
      </el-button>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { ElMessage, ElLoading } from "element-plus";
import { read, utils, writeFileXLSX } from "xlsx";
import axios from "axios";

// 状态管理
const importLoading = ref(false);
const exportLoading = ref(false);
const previewData = ref([]);
const excelHeaders = ref([]);
const rowErrors = ref({});
const sheetNames = ref([]);
const workbook = ref(null);

// 校验规则（示例）
const validationRules = {
  姓名: (value) => !!value || "姓名不能为空",
  年龄: (value) => (value >= 18 && value <= 60) || "年龄需在18-60之间",
  邮箱: (value) => /.+@.+\..+/.test(value) || "邮箱格式不正确",
};

// 计算属性
const hasValidationErrors = computed(
  () => Object.keys(rowErrors.value).length > 0,
);

const validationErrors = computed(() => Object.values(rowErrors.value).flat());

// 文件选择处理
const handleFileChange = async (uploadFile) => {
  const loading = ElLoading.service({ lock: true });
  try {
    const data = await uploadFile.raw.arrayBuffer();
    workbook.value = read(data);
    sheetNames.value = workbook.value.SheetNames;
    switchSheet(sheetNames.value[0]); // 默认显示第一个表
  } catch (error) {
    ElMessage.error(`文件解析失败: ${error.message}`);
  } finally {
    loading.close();
  }
};

// 切换表
const switchSheet = (sheetName) => {
  const worksheet = workbook.value.Sheets[sheetName];
  const jsonData = utils.sheet_to_json(worksheet, { header: 1, raw: false });

  excelHeaders.value = jsonData[0];
  previewData.value = jsonData.slice(1).map((row, index) => {
    const item = excelHeaders.value.reduce((obj, header, i) => {
      obj[header] = row[i] || "";
      return obj;
    }, {});
    validateRow(item, index); // 初始校验
    return item;
  });
};

// 单行数据校验
const validateRow = (row, rowIndex) => {
  const errors = [];
  Object.entries(validationRules).forEach(([field, validate]) => {
    if (row[field] !== undefined && !validate(row[field])) {
      errors.push(`${field}: ${validate(row[field])}`);
    }
  });

  if (errors.length) {
    rowErrors.value[rowIndex] = errors;
  } else {
    delete rowErrors.value[rowIndex];
  }
};

// 提交导入
const handleImport = async () => {
  importLoading.value = true;
  try {
    const validData = previewData.value.filter(
      (_, index) => !rowErrors.value[index],
    );
    const response = await axios.post("/api/import", validData);

    ElMessage.success(`成功导入 ${validData.length} 条数据`);
    previewData.value = []; // 清空预览
  } catch (error) {
    ElMessage.error(
      `导入失败: ${error.response?.data?.message || error.message}`,
    );
  } finally {
    importLoading.value = false;
  }
};

// 导出处理
const handleExport = async () => {
  exportLoading.value = true;
  try {
    const worksheet = utils.json_to_sheet(previewData.value);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "数据");
    writeFileXLSX(workbook, "导出数据.xlsx");
  } catch (error) {
    ElMessage.error("导出失败");
  } finally {
    exportLoading.value = false;
  }
};

// 获取最新数据
const fetchLatestData = async () => {
  exportLoading.value = true;
  try {
    const response = await axios.get("/api/data");
    previewData.value = response.data;
    ElMessage.success("数据已更新");
  } catch (error) {
    ElMessage.error("数据获取失败");
  } finally {
    exportLoading.value = false;
  }
};
</script>

<style scoped>
.error-cell {
  :deep(.el-input__inner) {
    border-color: #ff4d4f;
    background-color: #fff2f0;
  }
}

.error-messages {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
