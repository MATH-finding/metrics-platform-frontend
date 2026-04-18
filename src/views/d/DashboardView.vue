<template>
  <div class="dashboard-view" v-loading="loading">
    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" style="margin-bottom:16px" />

    <!-- 概览卡片 -->
    <OverviewCards :overview="overview" style="margin-bottom:20px" />

    <!-- 三图 -->
    <el-row :gutter="16" style="margin-bottom:20px">
      <el-col :span="10">
        <el-card shadow="hover">
          <template #header><span class="card-title">LOC 分布（Top 20）</span></template>
          <LocBarChart ref="locChart" :data="locDistribution" />
        </el-card>
      </el-col>
      <el-col :span="7">
        <el-card shadow="hover">
          <template #header><span class="card-title">复杂度分布</span></template>
          <ComplexityPieChart ref="complexChart" :data="complexityDistribution" />
        </el-card>
      </el-col>
      <el-col :span="7">
        <el-card shadow="hover">
          <template #header><span class="card-title">质量评级分布</span></template>
          <QualityDistChart ref="qualityChart" :data="qualityRatingDistribution" />
        </el-card>
      </el-col>
    </el-row>

    <!-- Top10 + 预警 -->
    <el-row :gutter="16">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header><span class="card-title">Top 10 类</span></template>
          <Top10Table
            :complexList="topComplexClasses"
            :sizeList="topSizeClasses"
            :couplingList="topCouplingClasses"
          />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header><span class="card-title">问题预警</span></template>
          <SmellAlerts :smells="smells" :limit="6" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getDashboard } from '../../api/dApi.js'
import OverviewCards from '../../components/d/OverviewCards.vue'
import LocBarChart from '../../components/d/LocBarChart.vue'
import ComplexityPieChart from '../../components/d/ComplexityPieChart.vue'
import QualityDistChart from '../../components/d/QualityDistChart.vue'
import Top10Table from '../../components/d/Top10Table.vue'
import SmellAlerts from '../../components/d/SmellAlerts.vue'

export default {
  name: 'DashboardView',
  components: { OverviewCards, LocBarChart, ComplexityPieChart, QualityDistChart, Top10Table, SmellAlerts },
  data() {
    return {
      loading: false,
      error: null,
      overview: {},
      locDistribution: [],
      complexityDistribution: {},
      qualityRatingDistribution: {},
      topComplexClasses: [],
      topSizeClasses: [],
      topCouplingClasses: [],
      smells: []
    }
  },
  mounted() { this.loadData() },
  methods: {
    async loadData() {
      this.loading = true
      this.error = null
      try {
        const res = await getDashboard()
        const d = res.data.data || res.data
        this.overview = d.overview || {}
        this.locDistribution = d.locDistribution || []
        this.complexityDistribution = d.complexityDistribution || {}
        this.qualityRatingDistribution = d.qualityRatingDistribution || {}
        this.topComplexClasses = d.topComplexClasses || []
        this.topSizeClasses = d.topSizeClasses || []
        this.topCouplingClasses = d.topCouplingClasses || []
        this.smells = (d.smellSummary?.smells) || []
        this.$nextTick(() => {
          setTimeout(() => {
            this.$refs.locChart?.forceRender()
            this.$refs.complexChart?.forceRender()
            this.$refs.qualityChart?.forceRender()
          }, 100)
        })
      } catch (e) {
        this.error = '加载仪表盘数据失败：' + (e.response?.data?.message || e.message)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.card-title { font-weight: 600; color: #333; }
</style>
