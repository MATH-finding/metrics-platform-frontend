<template>
  <div class="smells-view" v-loading="loading">
    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" style="margin-bottom:16px" />

    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-bottom:20px">
      <el-col :span="6">
        <el-card shadow="hover" style="text-align:center">
          <div class="big-num">{{ result.totalSmells ?? '-' }}</div>
          <div class="num-label">总坏味道数</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" style="text-align:center">
          <div class="big-num text-danger">{{ result.technicalDebt != null ? result.technicalDebt.toFixed(1) : '-' }}</div>
          <div class="num-label">技术债务（人天）</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" style="text-align:center">
          <div class="big-num text-warn">{{ countBySeverity.HIGH ?? 0 }}</div>
          <div class="num-label">高严重级别</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" style="text-align:center">
          <div class="big-num text-info">{{ countBySeverity.MEDIUM ?? 0 }}</div>
          <div class="num-label">中严重级别</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表 -->
    <el-row :gutter="16" style="margin-bottom:20px">
      <el-col :span="10">
        <el-card shadow="hover">
          <template #header><span class="card-title">严重程度分布</span></template>
          <SmellSeverityChart ref="severityChart" :data="countBySeverity" />
        </el-card>
      </el-col>
      <el-col :span="14">
        <el-card shadow="hover">
          <template #header><span class="card-title">类型分布</span></template>
          <SmellTypeChart ref="typeChart" :data="countByType" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细列表 -->
    <el-card shadow="hover">
      <template #header>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="card-title">坏味道详情</span>
          <el-space>
            <el-select v-model="filterSeverity" placeholder="严重程度" clearable style="width:130px">
              <el-option label="HIGH" value="HIGH" />
              <el-option label="MEDIUM" value="MEDIUM" />
              <el-option label="LOW" value="LOW" />
            </el-select>
            <el-select v-model="filterType" placeholder="坏味道类型" clearable style="width:180px">
              <el-option v-for="t in smellTypes" :key="t" :label="t" :value="t" />
            </el-select>
            <el-button type="primary" @click="handleDetect" :loading="loading">运行检测</el-button>
          </el-space>
        </div>
      </template>
      <el-table :data="filteredSmells" border stripe size="small" style="width:100%" max-height="420">
        <el-table-column prop="severity" label="严重程度" width="100">
          <template #default="{ row }">
            <el-tag :type="severityType(row.severity)" size="small">{{ row.severity }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="160" show-overflow-tooltip />
        <el-table-column prop="className" label="类名" min-width="160" show-overflow-tooltip />
        <el-table-column prop="methodName" label="方法名" min-width="140" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="suggestion" label="建议" min-width="200" show-overflow-tooltip />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { detectSmells, getSmellByType, getSmellBySeverity } from '../../api/dApi.js'
import SmellSeverityChart from '../../components/d/SmellSeverityChart.vue'
import SmellTypeChart from '../../components/d/SmellTypeChart.vue'

export default {
  name: 'SmellsView',
  components: { SmellSeverityChart, SmellTypeChart },
  data() {
    return {
      loading: false,
      error: null,
      result: {},
      countBySeverity: {},
      countByType: {},
      smells: [],
      filterSeverity: '',
      filterType: ''
    }
  },
  computed: {
    smellTypes() { return [...new Set(this.smells.map(s => s.type))] },
    filteredSmells() {
      return this.smells.filter(s => {
        return (!this.filterSeverity || s.severity === this.filterSeverity) &&
               (!this.filterType || s.type === this.filterType)
      })
    }
  },
  mounted() { this.handleDetect() },
  methods: {
    async handleDetect() {
      this.loading = true
      this.error = null
      try {
        const [smellRes, typeRes, sevRes] = await Promise.all([
          detectSmells(),
          getSmellByType(),
          getSmellBySeverity()
        ])
        const d = smellRes.data.data || smellRes.data
        this.result = d
        this.smells = d.smells || []
        this.countByType = typeRes.data.data || typeRes.data || {}
        this.countBySeverity = sevRes.data.data || sevRes.data || {}
        this.$nextTick(() => {
          setTimeout(() => {
            this.$refs.severityChart?.forceRender()
            this.$refs.typeChart?.forceRender()
          }, 100)
        })
      } catch (e) {
        this.error = '检测失败：' + (e.response?.data?.message || e.message)
      } finally {
        this.loading = false
      }
    },
    severityType(s) {
      return s === 'HIGH' ? 'danger' : s === 'MEDIUM' ? 'warning' : 'info'
    }
  }
}
</script>

<style scoped>
.card-title { font-weight: 600; color: #333; }
.big-num { font-size: 2em; font-weight: 700; color: #333; }
.num-label { font-size: 0.85em; color: #888; margin-top: 4px; }
.text-danger { color: #f5576c; }
.text-warn { color: #f09a3e; }
.text-info { color: #4facfe; }
</style>
