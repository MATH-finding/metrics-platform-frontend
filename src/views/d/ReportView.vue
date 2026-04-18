<template>
  <div class="report-view">
    <el-row :gutter="20">
      <!-- 生成表单 -->
      <el-col :span="10">
        <el-card shadow="hover">
          <template #header><span class="card-title">报告配置</span></template>
          <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" style="margin-bottom:12px" />

          <el-form :model="form" label-width="100px">
            <el-form-item label="项目名称">
              <el-input v-model="form.projectName" placeholder="输入项目名称" />
            </el-form-item>
            <el-form-item label="报告格式">
              <el-radio-group v-model="form.format">
                <el-radio value="HTML">HTML</el-radio>
                <el-radio value="PDF">PDF</el-radio>
                <el-radio value="EXCEL">Excel</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="包含内容">
              <el-checkbox-group v-model="form.sections">
                <el-row>
                  <el-col :span="12" v-for="s in sectionOptions" :key="s.value">
                    <el-checkbox :value="s.value" style="margin-bottom:6px">{{ s.label }}</el-checkbox>
                  </el-col>
                </el-row>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleGenerate" :loading="generating" style="width:100%">
                生成报告
              </el-button>
            </el-form-item>
            <el-form-item v-if="generating">
              <el-progress :percentage="genProgress" status="active" />
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 报告列表 -->
      <el-col :span="14">
        <el-card shadow="hover">
          <template #header>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span class="card-title">已生成报告</span>
              <el-button size="small" @click="loadReports" :loading="listLoading">刷新</el-button>
            </div>
          </template>
          <el-table :data="paginatedReports" border stripe size="small" style="width:100%" v-loading="listLoading">
            <el-table-column prop="fileName" label="文件名" min-width="180" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.projectName || row.fileName }}
              </template>
            </el-table-column>
            <el-table-column prop="format" label="格式" width="80" />
            <el-table-column prop="size" label="大小" width="100">
              <template #default="{ row }">{{ formatSize(row.size) }}</template>
            </el-table-column>
            <el-table-column prop="generatedAt" label="生成时间" width="160" show-overflow-tooltip>
              <template #default="{ row }">{{ formatTime(row.generatedAt) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" link @click="handleDownload(row.id)">下载</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-if="reports.length > pageSize"
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="reports.length"
            layout="total, prev, pager, next"
            style="margin-top:16px;justify-content:center"
          />
          <el-empty v-if="!reports.length && !listLoading" description="暂无报告" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { generateReport, listReports, getReportDownloadUrl } from '../../api/dApi.js'
import { ElMessage } from 'element-plus'

export default {
  name: 'ReportView',
  data() {
    return {
      generating: false,
      listLoading: false,
      error: null,
      genProgress: 0,
      currentPage: 1,
      pageSize: 10,
      form: {
        projectName: '',
        format: 'HTML',
        sections: ['overview', 'loc', 'complexity', 'ck', 'smells', 'effort', 'quality']
      },
      sectionOptions: [
        { label: 'LOC度量', value: 'loc' },
        { label: '圈复杂度', value: 'complexity' },
        { label: 'Halstead', value: 'halstead' },
        { label: 'CK度量', value: 'ck' },
        { label: 'LK度量', value: 'lk' },
        { label: '功能点（FP）', value: 'fp' },
        { label: 'UCP度量', value: 'ucp' },
        { label: '工作量跟踪', value: 'effort' },
        { label: '坏味道检测', value: 'smells' },
        { label: '项目概览', value: 'overview' },
        { label: '质量评估', value: 'quality' },
      ],
      reports: [],
      reportDetailsMap: {}
    }
  },
  computed: {
    paginatedReports() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.reports.slice(start, start + this.pageSize)
    }
  },
  mounted() { this.loadReports() },
  methods: {
    async handleGenerate() {
      if (!this.form.projectName.trim()) {
        ElMessage.warning('请输入项目名称')
        return
      }
      this.generating = true
      this.error = null
      this.genProgress = 0
      const timer = setInterval(() => { if (this.genProgress < 85) this.genProgress += 10 }, 400)
      try {
        const res = await generateReport({
          projectName: this.form.projectName,
          format: this.form.format,
          sections: this.form.sections,
          options: {}
        })
        this.genProgress = 100
        const report = res.data.data || res.data
        // 保存新生成的报告详情
        if (report && report.id) {
          this.reportDetailsMap[report.id] = report
        }
        ElMessage.success('报告生成成功')
        await this.loadReports()
      } catch (e) {
        this.error = '生成失败：' + (e.response?.data?.message || e.message)
      } finally {
        clearInterval(timer)
        setTimeout(() => { this.generating = false; this.genProgress = 0 }, 800)
      }
    },
    async loadReports() {
      this.listLoading = true
      try {
        const res = await listReports()
        const ids = res.data.data || res.data || []
        // 后端返回的是报告ID数组，转换成表格需要的对象格式
        this.reports = ids.map(id => {
          // 如果有缓存的详情，使用缓存
          if (this.reportDetailsMap[id]) {
            return this.reportDetailsMap[id]
          }
          // 否则使用默认格式
          return {
            id: id,
            projectName: `报告-${id.substring(0, 8)}`,
            fileName: 'report.html',
            format: 'HTML',
            size: null,
            generatedAt: null
          }
        })
        // 按生成时间倒序排列（最新的在最上面）
        this.reports.sort((a, b) => {
          if (!a.generatedAt) return 1
          if (!b.generatedAt) return -1
          return new Date(b.generatedAt) - new Date(a.generatedAt)
        })
      } catch (e) {
        // 忽略列表加载错误
      } finally {
        this.listLoading = false
      }
    },
    handleDownload(id) {
      window.open(getReportDownloadUrl(id), '_blank')
    },
    formatSize(bytes) {
      if (!bytes) return '-'
      if (bytes < 1024) return bytes + ' B'
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
      return (bytes / 1024 / 1024).toFixed(1) + ' MB'
    },
    formatTime(time) {
      if (!time) return '-'
      try {
        const d = new Date(time)
        return d.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      } catch {
        return time
      }
    }
  }
}
</script>

<style scoped>
.card-title { font-weight: 600; color: #333; }
</style>
