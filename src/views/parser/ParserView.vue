<template>
  <div style="padding: 24px;">
    <!-- 标题栏 -->
    <div style="margin-bottom: 20px;">
      <span style="font-size: 20px; font-weight: 500;">代码解析与度量</span>
      <el-button
          type="primary"
          style="margin-left: 16px;"
          :loading="loading"
          @click="handleRefresh"
      >
        {{ loading ? '加载中...' : '刷新数据' }}
      </el-button>
    </div>

    <!-- 错误提示 -->
    <el-alert
        v-if="error"
        :title="error"
        type="error"
        show-icon
        :closable="true"
        @close="error = null"
        style="margin-bottom: 16px;"
    />

    <!-- 文件上传面板 -->
    <UploadPanel
        :loading="uploading"
        @upload-success="handleUploadSuccess"
        @upload-error="handleUploadError"
        style="margin-bottom: 20px;"
    />

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" type="border-card" @tab-click="handleTabClick">

      <!-- 度量概览 -->
      <el-tab-pane label="度量概览" name="summary">
        <MetricsSummaryPanel :data="summaryData" />
      </el-tab-pane>

      <!-- 类与方法详情 -->
      <el-tab-pane label="类与方法详情" name="details">
        <div style="margin-bottom: 10px; color: #606266; font-size: 13px;">
          点击表格行查看方法详细度量
        </div>
        <MetricsTable
            :data="parseResult"
            @class-select="handleClassSelect"
            @method-select="handleMethodSelect"
        />
      </el-tab-pane>

      <!-- 复杂度分析 -->
      <el-tab-pane label="复杂度分析" name="complexity">
        <ComplexityChart
            ref="complexityChart"
            :data="parseResult"
        />
      </el-tab-pane>

      <!-- Halstead度量 -->
      <el-tab-pane label="Halstead度量" name="halstead">
        <HalsteadPanel
            :data="halsteadData"
            :selectedMethod="selectedMethod"
        />
      </el-tab-pane>

      <!-- 依赖关系图 -->
      <el-tab-pane label="依赖关系" name="dependencies">
        <DependencyGraph
            ref="dependencyGraph"
            :data="parseResult"
        />
      </el-tab-pane>

    </el-tabs>
  </div>
</template>

<script>
import {
  uploadAndParse,
  getParseResult,
  getHalsteadMetrics,
  getMetricsSummary
} from '@/api/parserApi.js'

import UploadPanel from '@/components/parser/UploadPanel.vue'
import MetricsSummaryPanel from '@/components/parser/MetricsSummaryPanel.vue'
import MetricsTable from '@/components/parser/MetricsTable.vue'
import ComplexityChart from '@/components/parser/ComplexityChart.vue'
import HalsteadPanel from '@/components/parser/HalsteadPanel.vue'
import DependencyGraph from '@/components/parser/DependencyGraph.vue'

export default {
  name: 'ParserView',
  components: {
    UploadPanel,
    MetricsSummaryPanel,
    MetricsTable,
    ComplexityChart,
    HalsteadPanel,
    DependencyGraph
  },
  data() {
    return {
      activeTab: 'summary',
      loading: false,
      uploading: false,
      error: null,
      parseResult: null,
      summaryData: null,
      halsteadData: null,
      selectedClass: null,
      selectedMethod: null
    }
  },
  mounted() {
    this.loadExistingData()
  },
  methods: {
    /**
     * 加载已存在的解析数据
     */
    async loadExistingData() {
      try {
        const response = await getParseResult()
        if (response.data.success) {
          this.parseResult = response.data.data
          await this.loadSummaryAndHalstead()
        }
      } catch (e) {
        // 还没有解析数据，等待用户上传
        console.log('暂无解析数据')
      }
    },

    /**
     * 加载汇总和Halstead数据
     */
    async loadSummaryAndHalstead() {
      try {
        const [summaryRes, halsteadRes] = await Promise.all([
          getMetricsSummary(),
          getHalsteadMetrics()
        ])
        this.summaryData = summaryRes.data.data
        this.halsteadData = halsteadRes.data.data
      } catch (e) {
        console.error('加载度量数据失败', e)
      }
    },

    /**
     * 处理文件上传成功
     */
    async handleUploadSuccess(response) {
      this.parseResult = response.data
      this.error = null
      await this.loadSummaryAndHalstead()
      this.activeTab = 'summary'
      this.$message.success('解析成功！')
    },

    /**
     * 处理上传错误
     */
    handleUploadError(errorMsg) {
      this.error = errorMsg
      this.$message.error(errorMsg)
    },

    /**
     * 刷新数据
     */
    async handleRefresh() {
      this.loading = true
      try {
        await this.loadExistingData()
        this.$message.success('刷新成功！')
      } catch (e) {
        this.error = '刷新失败，请检查后端服务'
      } finally {
        this.loading = false
      }
    },

    /**
     * 处理类选择
     */
    handleClassSelect(classData) {
      this.selectedClass = classData
    },

    /**
     * 处理方法选择
     */
    handleMethodSelect(methodData) {
      this.selectedMethod = methodData
      this.activeTab = 'halstead'
    },

    /**
     * 处理标签切换
     */
    handleTabClick(tab) {
      if (tab.paneName === 'complexity') {
        this.$nextTick(() => {
          setTimeout(() => {
            this.$refs.complexityChart && this.$refs.complexityChart.refresh()
          }, 100)
        })
      } else if (tab.paneName === 'dependencies') {
        this.$nextTick(() => {
          setTimeout(() => {
            this.$refs.dependencyGraph && this.$refs.dependencyGraph.refresh()
          }, 100)
        })
      }
    }
  }
}
</script>