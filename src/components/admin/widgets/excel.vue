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

        <el-table :data="previewData" border height="500px">
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
      <el-button
        type="text"
        @click="downloadTemplate"
        style="margin-left: 10px"
      >
        下载模板文件
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

const SAMPLE_HEADERS = [
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

// 数值型字段列表（需要验证数字类型）
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

// 新校验规则
const validationRules = {
  // 通用非空校验
  学院: (value) => !!value?.toString().trim() || "学院不能为空",
  姓名: (value) => !!value?.toString().trim() || "姓名不能为空",
  班级: (value) => !!value?.toString().trim() || "班级不能为空",

  // 学号特殊校验
  学号: (value) => {
    const val = value?.toString().trim();
    if (!val) return "学号不能为空";
    if (!/^\d{4}[a-zA-Z0-9]{6}$/.test(val))
      return "学号格式不正确（前4位为年份，总长10位）";
    return true;
  },
  // ^ 表示字符串开始
  // \d{4} 表示4位数字（年份）
  // [a-zA-Z0-9]{7} 表示7位字母或数字的组合
  // $ 表示字符串结束
  // 整体要求：4位年份 + 7位字母数字 = 11位总长度

  // 数值型字段校验
  ...Array.from(NUMBER_FIELDS).reduce((rules, field) => {
    rules[field] = (value) => {
      const num = Number(value);
      if (isNaN(num)) return `${field}必须为数字`;
      if (num < 0 || num > 20) return `${field}需在0-20之间`;
      return true;
    };
    return rules;
  }, {}),
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
// 修改后的切换Sheet方法
const switchSheet = (sheetName) => {
  const worksheet = workbook.value.Sheets[sheetName];
  const jsonData = utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
    defval: "", // 确保空单元格返回空字符串
  });

  // 表头校验
  if (!arraysEqual(jsonData[0], SAMPLE_HEADERS)) {
    ElMessage.error("文件列头与模板不一致，请下载模板文件");
    previewData.value = [];
    return;
  }

  excelHeaders.value = jsonData[0];

  // 数据处理
  previewData.value = jsonData.slice(1).map((row, index) => {
    const item = excelHeaders.value.reduce((obj, header, i) => {
      obj[header] = (row[i] ?? "").toString().trim(); // 统一转为字符串处理
      return obj;
    }, {});
    validateRow(item, index);
    return item;
  });
};

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
const downloadTemplate = () => {
  // 创建空模板工作簿
  const workbook = utils.book_new();
  const worksheet = utils.aoa_to_sheet([SAMPLE_HEADERS]);
  utils.book_append_sheet(workbook, worksheet, "素拓数据");
  writeFileXLSX(workbook, "素拓表模板.xlsx");
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
