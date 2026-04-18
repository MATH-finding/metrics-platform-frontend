<template>
  <div class="compare-view" v-loading="loading">
    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" style="margin-bottom:16px" />

    <div style="text-align:right;margin-bottom:12px">
      <el-button type="primary" @click="loadAll" :loading="loading">重新计算</el-button>
    </div>

    <!-- 1. 多种度量方法对比 -->
    <el-card shadow="hover" style="margin-bottom:20px">
      <template #header><span class="card-title">度量方法估算对比（FP vs UCP vs 特征点）</span></template>
      <el-row :gutter="16" style="margin-bottom:20px">
        <el-col :span="8" v-for="m in methods" :key="m.name">
          <div class="method-card" :style="{ borderTopColor: m.color }">
            <div class="method-name">{{ m.name }}</div>
            <el-row :gutter="8" style="margin-top:12px">
              <el-col :span="12" v-for="s in m.stats" :key="s.label">
                <div class="stat-box">
                  <div class="stat-val" :style="{ color: m.color }">{{ s.value ?? '-' }}</div>
                  <div class="stat-label">{{ s.label }}</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-col>
      </el-row>

      <!-- 估算工作量柱状图对比 -->
      <div ref="barEl" style="width:100%;height:300px"></div>
    </el-card>

    <!-- 2. 估算 vs 实际对比 -->
    <el-card shadow="hover" style="margin-bottom:20px">
      <template #header><span class="card-title">估算 vs 实际对比</span></template>
      <el-row :gutter="24">
        <el-col :span="12">
          <div ref="gaugeEl" style="width:100%;height:280px"></div>
        </el-col>
        <el-col :span="12">
          <el-table :data="compareRows" border size="small" style="width:100%;margin-top:8px">
            <el-table-column prop="metric" label="度量项" width="160" />
            <el-table-column prop="estimated" label="估算值" align="center">
              <template #default="{ row }">
                <span style="color:#667eea;font-weight:600">{{ row.estimated }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="actual" label="实际值" align="center">
              <template #default="{ row }">
                <span style="color:#43e97b;font-weight:600">{{ row.actual }}</span>
              </template>
            </el-table-column>
            <el-table-column label="偏差" align="center">
              <template #default="{ row }">
                <el-tag :type="row.variance > 0 ? 'danger' : row.variance < 0 ? 'success' : 'info'" size="small">
                  {{ row.variance > 0 ? '+' : '' }}{{ row.variance }}{{ row.unit }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
    </el-card>

    <!-- 3. 版本/历史对比 -->
    <el-card shadow="hover">
      <template #header>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="card-title">历史版本对比</span>
          <el-button size="small" type="success" @click="saveSnapshot">保存当前快照</el-button>
        </div>
      </template>
      <el-empty v-if="snapshots.length === 0" description="暂无历史快照，点击「保存当前快照」记录当前度量数据" :image-size="80" />
      <div v-else>
        <div ref="historyEl" style="width:100%;height:300px"></div>
        <el-table :data="snapshots" border size="small" style="width:100%;margin-top:16px" max-height="260">
          <el-table-column prop="label" label="版本标签" min-width="140" />
          <el-table-column prop="time" label="保存时间" width="170" />
          <el-table-column prop="totalLoc" label="代码行" width="90" align="center" />
          <el-table-column prop="estimatedPersonMonths" label="估算人月" width="90" align="center" />
          <el-table-column prop="actualWorkMonths" label="实际人月" width="90" align="center" />
          <el-table-column prop="progressPercent" label="进度%" width="80" align="center" />
          <el-table-column label="操作" width="80" align="center">
            <template #default="{ $index }">
              <el-button type="danger" link size="small" @click="deleteSnapshot($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { calculateUCP, calculateEffort, calculateFeaturePoint } from '../../api/dApi.js'
import { getDashboard } from '../../api/dApi.js'

const STORAGE_KEY = 'metrics_snapshots'

export default {
  name: 'CompareView',
  data() {
    return {
      loading: false,
      error: null,
      ucp: {},
      effort: {},
      fp: {},
      barChart: null,
      gaugeChart: null,
      historyChart: null,
      snapshots: []
    }
  },
  computed: {
    methods() {
      const u = this.ucp
      const e = this.effort
      const f = this.fp
      return [
        {
          name: '功能点（FP）',
          color: '#667eea',
          stats: [
            { label: '功能点数', value: f.functionPoints != null ? f.functionPoints.toFixed(1) : null },
            { label: '算法密集方法', value: f.algorithmCount != null ? f.algorithmCount : null },
            { label: '估算人月', value: f.estimatedPersonMonths != null ? f.estimatedPersonMonths.toFixed(2) : null },
            { label: '算法权重', value: f.algorithmWeight != null ? f.algorithmWeight.toFixed(1) : null },
          ]
        },
        {
          name: '用例点（UCP）',
          color: '#4facfe',
          stats: [
            { label: '总UCP', value: u.totalUcp != null ? u.totalUcp.toFixed(1) : null },
            { label: '估算工时(h)', value: u.estimatedHours != null ? Math.round(u.estimatedHours) : null },
            { label: '估算人月', value: u.estimatedPersonMonths != null ? u.estimatedPersonMonths.toFixed(2) : null },
            { label: '估算人天', value: u.estimatedPersonDays != null ? Math.round(u.estimatedPersonDays) : null },
          ]
        },
        {
          name: '特征点（FeatP）',
          color: '#f09a3e',
          stats: [
            { label: '特征点', value: f.totalFeaturePoints != null ? f.totalFeaturePoints.toFixed(1) : null },
            { label: '估算代码行', value: e.estimatedLoc != null ? Math.round(e.estimatedLoc) : null },
            { label: '估算人月', value: e.estimatedPersonMonths != null ? e.estimatedPersonMonths.toFixed(2) : null },
            { label: '估算工期(天)', value: e.estimatedDays != null ? Math.round(e.estimatedDays) : null },
          ]
        }
      ]
    },
    compareRows() {
      const e = this.effort
      const f = this.fp
      const u = this.ucp
      const fmt1 = v => v != null ? v.toFixed(2) : '-'
      const fmtInt = v => v != null ? Math.round(v) : '-'
      const diff = (a, b) => (a != null && b != null) ? Math.round((a - b) * 100) / 100 : '-'
      return [
        {
          metric: '估算代码行(LOC)',
          estimated: fmtInt(e.estimatedLoc),
          actual: fmtInt(e.totalLoc),
          variance: diff(e.totalLoc, e.estimatedLoc),
          unit: '行'
        },
        {
          metric: '估算人月(FP法)',
          estimated: fmt1(f.estimatedPersonMonths),
          actual: fmt1(e.actualWorkMonths),
          variance: diff(e.actualWorkMonths, f.estimatedPersonMonths),
          unit: '月'
        },
        {
          metric: '估算工期(天)',
          estimated: fmtInt(e.estimatedDays),
          actual: fmtInt(e.daysElapsed),
          variance: diff(e.daysElapsed, e.estimatedDays),
          unit: '天'
        },
        {
          metric: '预算成本(元)',
          estimated: e.budget != null ? Math.round(e.budget).toLocaleString() : '-',
          actual: e.laborCost != null ? Math.round(e.laborCost).toLocaleString() : '-',
          variance: e.costVariance != null ? Math.round(e.costVariance) : '-',
          unit: '元'
        },
        {
          metric: 'UCP估算人月',
          estimated: fmt1(u.estimatedPersonMonths),
          actual: fmt1(e.actualWorkMonths),
          variance: diff(e.actualWorkMonths, u.estimatedPersonMonths),
          unit: '月'
        },
      ]
    }
  },
  mounted() {
    this.snapshots = this.loadSnapshots()
    this.loadAll()
  },
  beforeUnmount() {
    this.barChart?.dispose()
    this.gaugeChart?.dispose()
    this.historyChart?.dispose()
  },
  methods: {
    async loadAll() {
      this.loading = true
      this.error = null
      try {
        const [ucpRes, effortRes, fpRes] = await Promise.allSettled([
          calculateUCP(),
          calculateEffort(),
          calculateFeaturePoint(),
        ])
        this.ucp = ucpRes.status === 'fulfilled' ? (ucpRes.value.data.data || ucpRes.value.data) : {}
        this.effort = effortRes.status === 'fulfilled' ? (effortRes.value.data.data || effortRes.value.data) : {}
        this.fp = fpRes.status === 'fulfilled' ? (fpRes.value.data.data || fpRes.value.data) : {}

        this.$nextTick(() => {
          setTimeout(() => {
            this.renderBar()
            this.renderGauge()
            if (this.snapshots.length > 0) this.renderHistory()
          }, 100)
        })
      } catch (e) {
        this.error = '加载失败：' + (e.message || e)
      } finally {
        this.loading = false
      }
    },

    renderBar() {
      if (!this.$refs.barEl) return
      if (!this.barChart) this.barChart = echarts.init(this.$refs.barEl)
      const u = this.ucp
      const e = this.effort
      const f = this.fp
      this.barChart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['FP估算人月', 'UCP估算人月', '实际人月'] },
        xAxis: { type: 'category', data: ['工作量（人月）'] },
        yAxis: { type: 'value', name: '人月' },
        series: [
          { name: 'FP估算人月', type: 'bar', data: [f.estimatedPersonMonths != null ? +f.estimatedPersonMonths.toFixed(2) : 0], itemStyle: { color: '#667eea' } },
          { name: 'UCP估算人月', type: 'bar', data: [u.estimatedPersonMonths != null ? +u.estimatedPersonMonths.toFixed(2) : 0], itemStyle: { color: '#4facfe' } },
          { name: '实际人月', type: 'bar', data: [e.actualWorkMonths != null ? +e.actualWorkMonths.toFixed(2) : 0], itemStyle: { color: '#43e97b' } },
        ]
      })
    },

    renderGauge() {
      if (!this.$refs.gaugeEl) return
      if (!this.gaugeChart) this.gaugeChart = echarts.init(this.$refs.gaugeEl)
      const progress = Math.min(100, Math.max(0, Math.round(this.effort.progressPercent || 0)))
      this.gaugeChart.setOption({
        title: { text: '项目完成进度', left: 'center', top: 8, textStyle: { fontSize: 14, color: '#666' } },
        series: [{
          type: 'gauge',
          startAngle: 200,
          endAngle: -20,
          min: 0,
          max: 100,
          splitNumber: 5,
          axisLine: {
            lineStyle: {
              width: 18,
              color: [[0.5, '#43e97b'], [0.8, '#4facfe'], [1, '#f5576c']]
            }
          },
          pointer: { itemStyle: { color: 'auto' } },
          axisTick: { distance: -24, splitNumber: 5, lineStyle: { width: 1, color: '#999' } },
          splitLine: { distance: -30, length: 12, lineStyle: { width: 2, color: '#999' } },
          axisLabel: { color: 'auto', distance: 30, fontSize: 12 },
          detail: {
            valueAnimation: true,
            formatter: '{value}%',
            color: 'auto',
            fontSize: 28,
            fontWeight: 700,
            offsetCenter: [0, '70%']
          },
          data: [{ value: progress, name: '进度' }]
        }]
      })
    },

    renderHistory() {
      if (!this.$refs.historyEl || this.snapshots.length === 0) return
      if (!this.historyChart) this.historyChart = echarts.init(this.$refs.historyEl)
      const labels = this.snapshots.map(s => s.label)
      this.historyChart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['代码行(÷10)', '实际人月', '估算人月', '进度%'] },
        xAxis: { type: 'category', data: labels },
        yAxis: { type: 'value' },
        series: [
          { name: '代码行(÷10)', type: 'line', smooth: true, data: this.snapshots.map(s => s.totalLoc ? Math.round(s.totalLoc / 10) : 0), itemStyle: { color: '#667eea' } },
          { name: '实际人月', type: 'line', smooth: true, data: this.snapshots.map(s => s.actualWorkMonths || 0), itemStyle: { color: '#43e97b' } },
          { name: '估算人月', type: 'line', smooth: true, data: this.snapshots.map(s => s.estimatedPersonMonths || 0), itemStyle: { color: '#4facfe' } },
          { name: '进度%', type: 'line', smooth: true, data: this.snapshots.map(s => s.progressPercent || 0), itemStyle: { color: '#f09a3e' } },
        ]
      })
    },

    saveSnapshot() {
      const e = this.effort
      const f = this.fp
      const now = new Date()
      const label = `快照 ${now.toLocaleDateString('zh-CN')} ${now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
      const snap = {
        label,
        time: now.toLocaleString('zh-CN'),
        totalLoc: e.totalLoc || 0,
        actualWorkMonths: e.actualWorkMonths != null ? +e.actualWorkMonths.toFixed(2) : 0,
        estimatedPersonMonths: (f.estimatedPersonMonths || e.estimatedPersonMonths) != null
          ? +((f.estimatedPersonMonths || e.estimatedPersonMonths).toFixed(2)) : 0,
        progressPercent: e.progressPercent != null ? +e.progressPercent.toFixed(1) : 0,
      }
      this.snapshots.push(snap)
      this.saveSnapshots()
      this.$nextTick(() => {
        setTimeout(() => this.renderHistory(), 100)
      })
      this.$message.success('快照已保存')
    },

    deleteSnapshot(idx) {
      this.snapshots.splice(idx, 1)
      this.saveSnapshots()
      if (this.snapshots.length > 0) {
        this.$nextTick(() => setTimeout(() => this.renderHistory(), 100))
      } else {
        this.historyChart?.clear()
      }
    },

    loadSnapshots() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
    },
    saveSnapshots() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.snapshots))
    }
  }
}
</script>

<style scoped>
.card-title { font-weight: 600; color: #333; }
.method-card {
  border: 1px solid #eee;
  border-top: 4px solid;
  border-radius: 8px;
  padding: 16px;
  height: 100%;
}
.method-name { font-size: 1.05em; font-weight: 700; color: #333; }
.stat-box { text-align: center; padding: 8px 0; }
.stat-val { font-size: 1.4em; font-weight: 700; }
.stat-label { font-size: 0.78em; color: #999; margin-top: 2px; }
</style>
