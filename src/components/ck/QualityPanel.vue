<template>
  <div>
    <div v-if="!selectedClass" style="text-align:center; color:#909399; padding: 60px 0;">
      请在表格中点击类名查看质量评估
    </div>
    <div v-else>
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
        <span style="font-size: 16px; font-weight: 500;">{{ selectedClass.className }}</span>
        <el-tag :type="gradeType" size="large">{{ scoreData ? scoreData.grade : '-' }} 级</el-tag>
      </div>

      <el-row :gutter="16" style="margin-bottom: 20px;">
        <el-col :span="6">
          <el-statistic title="综合质量分" :value="scoreData ? scoreData.totalScore : 0" suffix="/ 100" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="可维护性" :value="scoreData ? scoreData.maintainability : 0" suffix="分" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="可复用性" :value="scoreData ? scoreData.reusability : 0" suffix="分" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="可理解性" :value="scoreData ? scoreData.understandability : 0" suffix="分" />
        </el-col>
      </el-row>

      <el-progress
        :percentage="scoreData ? scoreData.totalScore : 0"
        :color="progressColor"
        :stroke-width="16"
        style="margin-bottom: 20px;"
      />

      <div style="font-weight: 500; margin-bottom: 10px;">改进建议</div>
      <el-alert
        v-for="(s, i) in suggestions"
        :key="i"
        :title="s"
        :type="s.includes('良好') ? 'success' : 'warning'"
        show-icon
        :closable="false"
        style="margin-bottom: 8px;"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'QualityPanel',
  props: {
    selectedClass: {
      type: Object,
      default: null
    },
    allScores: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    scoreData() {
      if (!this.selectedClass || !this.allScores.length) return null
      return this.allScores.find(s => s.className === this.selectedClass.className) || null
    },
    suggestions() {
      return this.scoreData ? this.scoreData.suggestions : []
    },
    gradeType() {
      const grade = this.scoreData ? this.scoreData.grade : 'D'
      return { A: 'success', B: '', C: 'warning', D: 'danger' }[grade] || 'info'
    },
    progressColor() {
      const score = this.scoreData ? this.scoreData.totalScore : 0
      if (score >= 85) return '#67c23a'
      if (score >= 70) return '#409eff'
      if (score >= 55) return '#e6a23c'
      return '#f56c6c'
    }
  }
}
</script>