<template>
  <div class="effort-view" v-loading="loading">
    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" style="margin-bottom:16px" />

    <div style="text-align:right;margin-bottom:12px">
      <el-button type="primary" @click="handleCalculate" :loading="loading">重新计算</el-button>
    </div>

    <!-- 进度区块 -->
    <el-row :gutter="16" style="margin-bottom:20px">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header><span class="card-title">项目进度</span></template>
          <el-row :gutter="24" align="middle">
            <el-col :span="12">
              <div style="margin-bottom:8px;color:#666">完成进度</div>
              <el-progress
                :percentage="Math.min(100, Math.round(data.progressPercent || 0))"
                :stroke-width="18"
                :status="progressStatus"
              />
              <el-row :gutter="12" style="margin-top:16px">
                <el-col :span="8"><StatItem label="已用天数" :value="data.daysElapsed" unit="天" /></el-col>
                <el-col :span="8"><StatItem label="剩余天数" :value="data.remainingDays != null ? Math.max(0, Math.round(data.remainingDays)) : null" unit="天" /></el-col>
                <el-col :span="8"><StatItem label="预计完成" :value="data.estimatedCompletionDate" /></el-col>
              </el-row>
            </el-col>
            <el-col :span="12">
              <!-- 简化甘特：已完成/剩余时间可视化 -->
              <div class="gantt-wrap">
                <div class="gantt-label">项目时间线</div>
                <div class="gantt-bar-bg">
                  <div class="gantt-done" :style="{ width: doneWidth + '%' }">已完成 {{ Math.round(data.progressPercent || 0) }}%</div>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:12px;color:#aaa;margin-top:4px">
                  <span>{{ data.startDate || '开始' }}</span>
                  <span>{{ data.estimatedCompletionDate || '预计结束' }}</span>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 成本区块 -->
    <el-row :gutter="16" style="margin-bottom:20px">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span class="card-title">成本跟踪</span></template>
          <el-row :gutter="12">
            <el-col :span="12"><StatItem label="人力成本" :value="data.laborCost != null ? Math.round(data.laborCost).toLocaleString() : null" unit="元" /></el-col>
            <el-col :span="12"><StatItem label="预算" :value="data.budget != null ? Math.round(data.budget).toLocaleString() : null" unit="元" /></el-col>
            <el-col :span="12" style="margin-top:12px"><StatItem label="单位成本" :value="data.unitCost != null ? data.unitCost.toFixed(2) : null" unit="元/行" /></el-col>
            <el-col :span="12" style="margin-top:12px">
              <StatItem label="成本偏差" :value="data.costVariancePercent != null ? data.costVariancePercent.toFixed(1) : null" unit="%" :danger="data.costVariancePercent > 0" />
            </el-col>
          </el-row>
          <el-alert
            v-if="data.costVariancePercent > 10"
            title="成本超支预警"
            :description="`当前成本超出预算 ${data.costVariancePercent?.toFixed(1)}%`"
            type="error"
            show-icon
            :closable="false"
            style="margin-top:12px"
          />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span class="card-title">生产率</span></template>
          <el-row :gutter="12">
            <el-col :span="12"><StatItem label="实际生产率" :value="data.productivity != null ? data.productivity.toFixed(1) : null" unit="行/月" /></el-col>
            <el-col :span="12"><StatItem label="估算生产率" :value="data.estimatedProductivity != null ? data.estimatedProductivity.toFixed(1) : null" unit="行/月" /></el-col>
            <el-col :span="12" style="margin-top:12px"><StatItem label="实际人月" :value="data.actualWorkMonths != null ? data.actualWorkMonths.toFixed(2) : null" unit="月" /></el-col>
            <el-col :span="12" style="margin-top:12px"><StatItem label="估算人月" :value="data.estimatedPersonMonths != null ? data.estimatedPersonMonths.toFixed(2) : null" unit="月" /></el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 代码规模 -->
    <el-card shadow="hover">
      <template #header><span class="card-title">代码规模</span></template>
      <el-row :gutter="24">
        <el-col :span="6"><StatItem label="总代码行" :value="data.totalLoc" /></el-col>
        <el-col :span="6"><StatItem label="估算代码行" :value="data.estimatedLoc" /></el-col>
        <el-col :span="6"><StatItem label="总方法数" :value="data.totalMethods" /></el-col>
        <el-col :span="6"><StatItem label="总类数" :value="data.totalClasses" /></el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import { calculateEffort } from '../../api/dApi.js'

const StatItem = {
  props: { label: String, value: [Number, String], unit: String, danger: Boolean },
  template: `
    <div style="text-align:center;padding:8px 0">
      <div style="font-size:1.4em;font-weight:700" :style="{ color: danger ? '#f5576c' : '#333' }">
        {{ value ?? '-' }}<span v-if="unit && value != null" style="font-size:0.6em;color:#888"> {{ unit }}</span>
      </div>
      <div style="font-size:0.8em;color:#888;margin-top:2px">{{ label }}</div>
    </div>
  `
}

export default {
  name: 'EffortView',
  components: { StatItem },
  data() {
    return {
      loading: false,
      error: null,
      data: {}
    }
  },
  computed: {
    doneWidth() { return Math.min(100, Math.max(2, Math.round(this.data.progressPercent || 0))) },
    progressStatus() {
      const p = this.data.progressPercent || 0
      return p >= 100 ? 'success' : p > 80 ? 'warning' : ''
    }
  },
  mounted() { this.handleCalculate() },
  methods: {
    async handleCalculate() {
      this.loading = true
      this.error = null
      try {
        const res = await calculateEffort()
        console.log('Raw response:', res)
        console.log('res.data:', res.data)
        console.log('res.data.data:', res.data.data)

        this.data = res.data.data || res.data

        console.log('Final this.data:', this.data)
        console.log('laborCost:', this.data.laborCost, 'type:', typeof this.data.laborCost)
        console.log('productivity:', this.data.productivity, 'type:', typeof this.data.productivity)
        console.log('budget:', this.data.budget, 'type:', typeof this.data.budget)
        console.log('actualWorkMonths:', this.data.actualWorkMonths, 'type:', typeof this.data.actualWorkMonths)
      } catch (e) {
        console.error('Error calculating effort:', e)
        this.error = '计算失败：' + (e.response?.data?.message || e.message)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.card-title { font-weight: 600; color: #333; }
.gantt-wrap { padding: 8px 0; }
.gantt-label { font-size: 13px; color: #666; margin-bottom: 8px; }
.gantt-bar-bg { height: 28px; background: #f0f0f0; border-radius: 14px; overflow: hidden; }
.gantt-done {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #43e97b);
  border-radius: 14px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  min-width: 60px;
  transition: width 0.5s;
}
</style>
