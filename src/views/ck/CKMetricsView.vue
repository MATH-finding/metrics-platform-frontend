<template>
  <div style="padding: 24px;">
    <div style="margin-bottom: 20px;">
      <span style="font-size: 20px; font-weight: 500;">CK 度量分析</span>
      <el-button
        type="primary"
        style="margin-left: 16px;"
        :loading="loading"
        @click="loadData"
      >
        {{ loading ? '计算中...' : '开始度量' }}
      </el-button>
    </div>

    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      :closable="false"
      style="margin-bottom: 16px;"
    />

    <el-tabs v-model="activeTab" type="border-card" @tab-click="handleTabClick">

      <el-tab-pane label="度量结果表格" name="table">
        <CKTable
          :data="ckData"
          @select="handleClassSelect"
          @selectionChange="handleSelectionChange"
        />
      </el-tab-pane>

      <el-tab-pane label="雷达图对比" name="radar">
        <div style="margin-bottom: 10px; color: #606266; font-size: 13px;">
          在表格中勾选类（最多5个）后切换到此标签查看对比
        </div>
        <CKRadarChart ref="radarChart" :selectedClasses="selectedClasses" />
      </el-tab-pane>

      <el-tab-pane label="质量评估" name="quality">
        <QualityPanel
          :selectedClass="selectedClass"
          :allScores="qualityData"
        />
      </el-tab-pane>

    </el-tabs>
  </div>
</template>

<script>
import { fetchCKMetrics, fetchQualityScore } from '@/api/ckApi.js'
import CKTable from '@/components/ck/CKTable.vue'
import CKRadarChart from '@/components/ck/CKRadarChart.vue'
import QualityPanel from '@/components/ck/QualityPanel.vue'

export default {
  name: 'CKMetricsView',
  components: { CKTable, CKRadarChart, QualityPanel },
  data() {
    return {
      activeTab: 'table',
      loading: false,
      error: null,
      ckData: [],
      qualityData: [],
      selectedClass: null,
      selectedClasses: []
    }
  },
  methods: {
    async loadData() {
      this.loading = true
      this.error = null
      try {
        const [ckRes, qualityRes] = await Promise.all([
          fetchCKMetrics(),
          fetchQualityScore()
        ])
        this.ckData = ckRes.data.data
        this.qualityData = qualityRes.data.data
      } catch (e) {
        this.error = '请求失败，请确认后端服务已启动（http://localhost:8080）'
      } finally {
        this.loading = false
      }
    },
    handleClassSelect(row) {
      this.selectedClass = row
      this.activeTab = 'quality'
    },
    handleSelectionChange(rows) {
      this.selectedClasses = rows.slice(0, 5)
    },
    handleTabClick(tab) {
      if (tab.paneName === 'radar') {
        this.$nextTick(() => {
          setTimeout(() => {
            this.$refs.radarChart && this.$refs.radarChart.forceRender()
          }, 100)
        })
      }
    }
  }
}
</script>