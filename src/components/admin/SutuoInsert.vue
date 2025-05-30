<script setup>
import { ref, computed } from "vue";
import { ElMessage, ElLoading } from "element-plus";
import { read, utils, writeFileXLSX } from "xlsx";
import axios from "axios";
import { store } from "@/store";

// 状态管理
const importLoading = ref(false);
const previewData = ref([]);
const excelHeaders = ref([]);
const rowErrors = ref({});
const operator = ref(String(store.userId));
const originalFile = ref(null);

const SAMPLE_HEADERS = [
  "活动名称",
  "活动日期",
  "学院",
  "姓名",
  "班级",
  "学号",
  "德育",
  "智育",
  "美育",
  "体育",
  "校园",
  "乡土",
  "产学",
  "家庭",
  "寝室",
  "志愿时长",
];
// 数值型字段校验
const NUMBER_FIELDS = new Set([
  "德育",
  "智育",
  "美育",
  "体育",
  "校园",
  "乡土",
  "产学",
  "家庭",
  "寝室",
  "志愿时长",
]);

// 校验规则（增强学号校验）
const validationRules = {
  活动名称: (v) => !!v?.trim() || "活动名称不能为空",
  活动日期: (v) => {
    if (!v?.trim()) return "活动日期不能为空";
    const date = new Date(v);
    if (isNaN(date.getTime())) return "请输入有效的日期格式";
    return true;
  },
  学院: (v) => !!v?.trim() || "学院不能为空",
  姓名: (v) => !!v?.trim() || "姓名不能为空",
  班级: (v) => !!v?.trim() || "班级不能为空",
  学号: (v) => {
    const val = v?.toString().trim();
    if (!val) return "学号不能为空";
    if (!/^\d{4}[a-zA-Z0-9]{6}$/.test(val))
      return "学号格式不正确（4位年份+6位字符）";
    return true;
  },
  ...Array.from(NUMBER_FIELDS).reduce((acc, field) => {
    acc[field] = (v) => {
      if (!v && v !== 0) return true; // 允许空值
      const num = Number(v);
      if (isNaN(num)) return `${field}必须为数字`;
      if (num < 0 || num > 20) return `${field}需在0-20之间`;
      return true;
    };
    return acc;
  }, {}),
};

// 计算属性
const hasValidationErrors = computed(
  () => Object.keys(rowErrors.value).length > 0,
);

const validationErrors = computed(() => Object.values(rowErrors.value).flat());

// 文件处理
const handleFileChange = async (uploadFile) => {
  const loading = ElLoading.service({ lock: true });
  try {
    // 保存原始文件供后续上传使用
    originalFile.value = uploadFile.raw;

    const data = await uploadFile.raw.arrayBuffer();
    const workbook = read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
      defval: "",
    });

    // 表头校验
    if (!arraysEqual(jsonData[0], SAMPLE_HEADERS)) {
      ElMessage.error("文件列头与模板不一致");
      previewData.value = [];
      return;
    }

    excelHeaders.value = jsonData[0];
    previewData.value = jsonData.slice(1).map((row, index) => {
      const item = excelHeaders.value.reduce((obj, header, i) => {
        obj[header] = (row[i] ?? "").toString().trim();
        return obj;
      }, {});
      validateRow(item, index);
      return item;
    });
  } catch (error) {
    ElMessage.error(`文件解析失败: ${error.message}`);
  } finally {
    loading.close();
  }
};

// 提交导入
const handleImport = async () => {
  importLoading.value = true;
  try {
    if (!originalFile.value) {
      ElMessage.error("请先选择文件");
      return;
    }

    if (hasValidationErrors.value) {
      ElMessage.error("请先修正数据错误");
      return;
    }

    const formData = new FormData();
    formData.append("file", originalFile.value);
    formData.append("operator", operator.value || String(store.userId));

    const response = await axios.post("/api/sutuo/upload", formData);
    ElMessage.success(`成功导入 ${response.data.count} 条数据`);
    previewData.value = [];
    originalFile.value = null;
  } catch (error) {
    console.error("导入失败详情:", error);
    const msg = error.response?.data?.error || error.message;
    ElMessage.error(`导入失败: ${msg}`);
  } finally {
    importLoading.value = false;
  }
};

// // 下载原始文件
// const handleExportHash = () => {
//   if (!currentFileHash.value) {
//     ElMessage.warning("请先上传文件");
//     return;
//   }
//   window.open(`/api/sutuo/download/${currentFileHash.value}`, "_blank");
// };

// 辅助方法：严格比较数组
const arraysEqual = (a, b) => {
  if (a?.length !== b?.length) return false;
  return a.every((val, index) => val === b[index]);
};

// 修改后的校验方法
const validateRow = (row, rowIndex) => {
  const errors = [];
  // 遍历所有字段
  excelHeaders.value.forEach((header) => {
    const validator = validationRules[header];
    if (validator) {
      const result = validator(row[header]);
      if (result !== true) errors.push(result);
    }
  });

  // 检查是否存在额外字段
  const extraFields = Object.keys(row).filter(
    (key) => !excelHeaders.value.includes(key),
  );
  if (extraFields.length) {
    errors.push(`存在额外字段：${extraFields.join(", ")}`);
  }

  if (errors.length) {
    rowErrors.value[rowIndex] = errors;
  } else {
    delete rowErrors.value[rowIndex];
  }
};

const downloadTemplate = () => {
  // 创建空模板工作簿
  const workbook = utils.book_new();
  const worksheet = utils.aoa_to_sheet([SAMPLE_HEADERS]);
  utils.book_append_sheet(workbook, worksheet, "素拓数据");
  writeFileXLSX(workbook, "素拓表模板.xlsx");
};
</script>

<template>
  <div class="excel-import-export">
    <el-card shadow="hover" class="flex-card">
      <template #header>
        <div class="card-header">
          <span>素拓信息导入</span>
          <el-button type="primary" link @click="downloadTemplate">
            下载模板
          </el-button>
        </div>
      </template>

      <el-upload
        :auto-upload="false"
        :show-file-list="false"
        :on-change="handleFileChange"
        accept=".xlsx, .xls"
      >
        <template #trigger>
          <el-button type="primary" :loading="importLoading">
            选择 Excel 文件
          </el-button>
        </template>

        <el-button
          type="success"
          :disabled="!previewData.length || hasValidationErrors"
          @click="handleImport"
          :loading="importLoading"
          class="ml-2"
        >
          确认导入
        </el-button>
      </el-upload>

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

        <el-table :data="previewData" border height="900px">
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
  </div>
</template>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-actions {
  display: flex;
  gap: 8px;
}

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

.excel-import-export {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.flex-card {
  flex: 1;
  display: flex !important;
  flex-direction: column;
  min-height: 0;
}

:deep(.flex-card .el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;
}

:deep(.el-table) {
  flex: 1;
  margin-bottom: 16px;
}
</style>
