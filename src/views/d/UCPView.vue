<template>
  <div class="ucp-view" v-loading="loading">
    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" style="margin-bottom:16px" />

    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-bottom:20px">
      <el-col :span="4" v-for="c in statCards" :key="c.label">
        <el-card shadow="hover" style="text-align:center">
          <div class="big-num" :style="{ color: c.color }">{{ c.value ?? '-' }}</div>
          <div class="num-label">{{ c.label }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <!-- 用例详情表格 -->
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span class="card-title">用例详情</span>
              <el-button type="primary" @click="handleCalculate" :loading="loading" size="small">重新计算</el-button>
            </div>
          </template>
          <el-table :data="details" border stripe size="small" style="width:100%" max-height="500">
            <el-table-column prop="methodName" label="方法名" min-width="180" show-overflow-tooltip />
            <el-table-column prop="className" label="所属类" min-width="160" show-overflow-tooltip />
            <el-table-column prop="parameterCount" label="参数数" width="80" sortable />
            <el-table-column prop="complexity" label="圈复杂度" width="90" sortable />
            <el-table-column prop="category" label="分类" width="90">
              <template #default="{ row }">
                <el-tag :type="catType(row.category)" size="small">{{ row.category }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="weight" label="权重" width="70" />
          </el-table>
        </el-card>
      </el-col>

      <!-- 分类饼图 -->
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header><span class="card-title">用例分类分布</span></template>
          <div ref="pieEl" style="width:100%;height:320px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { calculateUCP } from '../../api/dApi.js'

export default {
  name: 'UCPView',
  data() {
    return {
      loading: false,
      error: null,
      result: {},
      details: [],
      pie: null
    }
  },
  computed: {
    statCards() {
      const r = this.result
      return [
        { label: '简单用例', value: r.simpleCount, color: '#43e97b' },
        { label: '中等用例', value: r.averageCount, color: '#4facfe' },
        { label: '复杂用例', value: r.complexCount, color: '#f5576c' },
        { label: '总UCP', value: r.totalUcp, color: '#667eea' },
        { label: '估算工时(h)', value: r.estimatedHours != null ? r.estimatedHours.toFixed(0) : null, color: '#f09a3e' },
        { label: '估算人月', value: r.estimatedPersonMonths != null ? r.estimatedPersonMonths.toFixed(2) : null, color: '#a29bfe' },
      ]
    }
  },
  mounted() { this.handleCalculate() },
  beforeUnmount() { this.pie?.dispose() },
  methods: {
    async handleCalculate() {
      this.loading = true
      this.error = null
      try {
        const res = await calculateUCP()
        const d = res.data.data || res.data
        this.result = d
        this.details = d.details || []
        this.$nextTick(() => { setTimeout(() => this.renderPie(), 100) })
      } catch (e) {
        this.error = '计算失败：' + (e.response?.data?.message || e.message)
      } finally {
        this.loading = false
      }
    },
    renderPie() {
      if (!this.$refs.pieEl) return
      if (!this.pie) this.pie = echarts.init(this.$refs.pieEl)
      const r = this.result
      this.pie.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { bottom: 0 },
        series: [{
          type: 'pie',
          radius: ['40%', '65%'],
          data: [
            { name: '简单', value: r.simpleCount || 0, itemStyle: { color: '#43e97b' } },
            { name: '中等', value: r.averageCount || 0, itemStyle: { color: '#4facfe' } },
            { name: '复杂', value: r.complexCount || 0, itemStyle: { color: '#f5576c' } },
          ]
        }]
      })
    },
    catType(c) { return c === '复杂' ? 'danger' : c === '中等' ? 'warning' : 'success' }
  }
}
</script>

<style scoped>
.card-title { font-weight: 600; color: #333; }
.big-num { font-size: 1.8em; font-weight: 700; }
.num-label { font-size: 0.8em; color: #888; margin-top: 4px; }
</style>
