\<template>
  <div style="padding: 24px;">
    <div style="margin-bottom: 20px;">
      <span style="font-size: 20px; font-weight: 500;">LK分析</span>
      <el-button type="primary" style="margin-left: 16px;" :loading="loading" @click="loadData">
        {{ loading ? '计算中...' : '开始度量' }}
      </el-button>
    </div>

    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" style="margin-bottom: 16px;" />

    <el-tabs v-model="activeTab" type="border-card" @tab-click="handleTabClick">
      <el-tab-pane label="LK度量结果表格" name="table">
        <LKTable :data="lkData" />
      </el-tab-pane>
      <el-tab-pane label="耦合矩阵热力图" name="heatmap">
        <div style="margin-bottom: 10px; color: #606266; font-size: 13px;">基于 DAC 与 MPC 的类间耦合模拟可视化</div>
        <CouplingHeatmap ref="heatmapChart" :data="lkData" />
      </el-tab-pane>
      <el-tab-pane label="类依赖网络图" name="network">
        <div style="margin-bottom: 10px; color: #606266; font-size: 13px;">节点大小代表SIZE1，连线代表方法多态性调用</div>
        <DependencyNetwork ref="networkChart" :data="lkData" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { fetchLKMetrics } from '@/api/lkApi.js'

import LKTable from '@/components/lk/LKTable.vue'
import CouplingHeatmap from '@/components/lk/CouplingHeatmap.vue'
import DependencyNetwork from '@/components/lk/DependencyNetwork.vue'

export default {
  name: 'LKMetricsView',
  components: { LKTable, CouplingHeatmap, DependencyNetwork },
  data() {
    return {
      activeTab: 'table',
      loading: false,
      error: null,
      lkData: [],
    }
  },
  methods: {
    async loadData() {
      this.loading = true
      this.error = null
      try {
        const lkRes = await fetchLKMetrics()
        const lkReport = lkRes.data.data || lkRes.data
        
        this.lkData = Array.isArray(lkReport) ? lkReport : (lkReport.lkMetrics || [])


      } catch (e) {
        console.error(e)
        this.error = '请求失败，请确认后端服务已启动且接口可用'
      } finally {
        this.loading = false
      }
    },
    handleTabClick(tab) {
      this.$nextTick(() => {
        setTimeout(() => {
          if (tab.paneName === 'heatmap') this.$refs.heatmapChart?.forceRender()
          if (tab.paneName === 'network') this.$refs.networkChart?.forceRender()
        }, 100)
      })
    }
  }
}
</script>