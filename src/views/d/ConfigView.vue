<template>
  <div class="config-view">
    <el-card class="config-card">
      <template #header>
        <span class="card-title">项目基本信息</span>
      </template>
      <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" style="margin-bottom:16px" />
      <el-form :model="form" label-width="130px" :rules="rules" ref="formRef">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="项目名称" prop="projectName">
              <el-input v-model="form.projectName" placeholder="请输入项目名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="团队人数" prop="teamSize">
              <el-input-number v-model="form.teamSize" :min="1" :max="100" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker v-model="form.startDate" type="date" value-format="YYYY-MM-DD" placeholder="选择开始日期" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="当前日期" prop="currentDate">
              <el-date-picker v-model="form.currentDate" type="date" value-format="YYYY-MM-DD" placeholder="选择当前日期" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="平均月薪（元）" prop="avgSalary">
              <el-input-number v-model="form.avgSalary" :min="0" :step="1000" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="语言因子" prop="languageFactor">
              <el-input-number v-model="form.languageFactor" :min="1" :step="1" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生产率（FP/月）" prop="productivity">
              <el-input-number v-model="form.productivity" :min="1" :step="1" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工作日（天/月）" prop="workingDaysPerMonth">
              <el-input-number v-model="form.workingDaysPerMonth" :min="1" :max="31" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工时（小时/天）" prop="workingHoursPerDay">
              <el-input-number v-model="form.workingHoursPerDay" :min="1" :max="24" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-space>
            <el-button type="primary" @click="handleSave" :loading="saving">保存配置</el-button>
            <el-button @click="handleReset" :loading="resetting">重置默认</el-button>
            <el-button @click="handleExport">导出 JSON</el-button>
            <el-upload
              ref="uploadRef"
              :show-file-list="false"
              accept=".json"
              :before-upload="handleImport"
              action=""
            >
              <el-button>导入 JSON</el-button>
            </el-upload>
          </el-space>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { getConfig, saveConfig, resetConfig } from '../../api/dApi.js'
import { ElMessage } from 'element-plus'

export default {
  name: 'ConfigView',
  data() {
    return {
      saving: false,
      resetting: false,
      error: null,
      form: {
        projectName: '',
        startDate: '',
        currentDate: '',
        teamSize: 5,
        avgSalary: 20000,
        languageFactor: 53,
        productivity: 15,
        workingDaysPerMonth: 22,
        workingHoursPerDay: 8
      },
      rules: {
        projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
        startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
        currentDate: [{ required: true, message: '请选择当前日期', trigger: 'change' }],
        teamSize: [{ required: true, message: '请输入团队人数', trigger: 'blur' }],
      }
    }
  },
  mounted() {
    this.loadConfig()
  },
  methods: {
    async loadConfig() {
      try {
        const res = await getConfig()
        const d = res.data.data || res.data
        if (d) Object.assign(this.form, d)
      } catch (e) {
        // 首次使用可能没有配置文件，忽略
      }
    },
    async handleSave() {
      await this.$refs.formRef.validate()
      this.saving = true
      this.error = null
      try {
        await saveConfig(this.form)
        ElMessage.success('配置已保存')
      } catch (e) {
        this.error = '保存失败：' + (e.response?.data?.message || e.message)
      } finally {
        this.saving = false
      }
    },
    async handleReset() {
      this.resetting = true
      this.error = null
      try {
        const res = await resetConfig()
        const d = res.data.data || res.data
        if (d) Object.assign(this.form, d)
        ElMessage.success('已重置为默认配置')
      } catch (e) {
        this.error = '重置失败：' + (e.response?.data?.message || e.message)
      } finally {
        this.resetting = false
      }
    },
    handleExport() {
      const blob = new Blob([JSON.stringify(this.form, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'project-config.json'
      a.click()
      URL.revokeObjectURL(url)
    },
    handleImport(file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          Object.assign(this.form, data)
          ElMessage.success('配置已导入')
        } catch {
          ElMessage.error('JSON 格式错误')
        }
      }
      reader.readAsText(file)
      return false
    }
  }
}
</script>

<style scoped>
.config-view { max-width: 900px; margin: 0 auto; }
.config-card { border-radius: 12px; }
.card-title { font-size: 1.1em; font-weight: 600; color: #333; }
</style>
