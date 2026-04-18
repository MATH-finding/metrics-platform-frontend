<template>
  <div class="overview-cards">
    <el-row :gutter="16">
      <el-col :span="4" v-for="item in cards" :key="item.label">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" :style="{ background: item.color }">
            <el-icon :size="22"><component :is="item.icon" /></el-icon>
          </div>
          <div class="stat-value">{{ item.value ?? '-' }}</div>
          <div class="stat-label">{{ item.label }}</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { Files, Memo, Star, Clock, Warning, Coin } from '@element-plus/icons-vue'

export default {
  name: 'OverviewCards',
  components: { Files, Memo, Star, Clock, Warning, Coin },
  props: {
    overview: { type: Object, default: () => ({}) }
  },
  computed: {
    cards() {
      const o = this.overview
      return [
        { label: '总类数', value: o.totalClasses, icon: 'Files', color: '#667eea22' },
        { label: '总代码行', value: o.totalLoc, icon: 'Memo', color: '#43e97b22' },
        { label: '质量评分', value: o.overallQualityScore != null ? o.overallQualityScore.toFixed(1) : '-', icon: 'Star', color: '#f6d36522' },
        { label: '技术债务(人天)', value: o.technicalDebt != null ? o.technicalDebt.toFixed(1) : '-', icon: 'Clock', color: '#f09a3e22' },
        { label: '坏味道数', value: o.totalSmells, icon: 'Warning', color: '#f5576c22' },
        { label: '预估成本(元)', value: o.totalCost != null ? Math.round(o.totalCost).toLocaleString() : '-', icon: 'Coin', color: '#4facfe22' },
      ]
    }
  }
}
</script>

<style scoped>
.stat-card { text-align: center; padding: 8px 0; border-radius: 10px; }
.stat-icon { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; }
.stat-value { font-size: 1.5em; font-weight: 700; color: #333; }
.stat-label { font-size: 0.8em; color: #888; margin-top: 4px; }
</style>
