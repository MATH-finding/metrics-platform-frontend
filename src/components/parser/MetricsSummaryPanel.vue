<template>
  <div v-if="data">
    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="总类数" :value="data.totalClasses">
            <template #prefix>
              <el-icon style="color: #409EFF;"><Document /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="总方法数" :value="data.totalMethods">
            <template #prefix>
              <el-icon style="color: #67C23A;"><Operation /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="总代码行数" :value="data.totalCodeLines">
            <template #prefix>
              <el-icon style="color: #E6A23C;"><Edit /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="平均复杂度" :value="data.averageComplexity" :precision="2">
            <template #prefix>
              <el-icon style="color: #F56C6C;"><TrendCharts /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细统计 -->
    <el-card shadow="hover">
      <template #header>
        <span style="font-weight: 500;">详细统计</span>
      </template>

      <el-descriptions :column="3" border>
        <el-descriptions-item label="总行数">
          {{ data.totalLines }}
        </el-descriptions-item>
        <el-descriptions-item label="注释行">
          {{ data.totalCommentLines }}
        </el-descriptions-item>
        <el-descriptions-item label="空行">
          {{ data.totalBlankLines }}
        </el-descriptions-item>

        <el-descriptions-item label="平均注释率">
          {{ data.averageCommentRate }}
        </el-descriptions-item>
        <el-descriptions-item label="最大复杂度">
          <el-tag :type="data.maxComplexity > 10 ? 'danger' : 'success'">
            {{ data.maxComplexity }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="高复杂度方法">
          <el-tag :type="data.highComplexityMethods > 0 ? 'warning' : 'success'">
            {{ data.highComplexityMethods }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="平均方法长度">
          {{ data.averageMethodLength }}
        </el-descriptions-item>
        <el-descriptions-item label="最大方法长度">
          {{ data.maxMethodLength }}
        </el-descriptions-item>
        <el-descriptions-item label="长方法数">
          <el-tag :type="data.longMethods > 0 ? 'warning' : 'success'">
            {{ data.longMethods }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- Top复杂方法 -->
    <el-card shadow="hover" style="margin-top: 16px;">
      <template #header>
        <span style="font-weight: 500;">🔥 Top 5 复杂方法</span>
      </template>

      <el-table :data="data.topComplexMethods" stripe>
        <el-table-column prop="class" label="类名" width="200" />
        <el-table-column prop="method" label="方法名" width="200" />
        <el-table-column prop="complexity" label="复杂度" width="100">
          <template #default="scope">
            <el-tag :type="getComplexityType(scope.row.complexity)">
              {{ scope.row.complexity }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="codeLines" label="代码行数" />
      </el-table>
    </el-card>
  </div>

  <el-empty v-else description="暂无数据，请先上传代码文件" />
</template>

<script>
import { Document, Operation, Edit, TrendCharts } from '@element-plus/icons-vue'

export default {
  name: 'MetricsSummaryPanel',
  components: { Document, Operation, Edit, TrendCharts },
  props: {
    data: {
      type: Object,
      default: null
    }
  },
  methods: {
    getComplexityType(complexity) {
      if (complexity <= 5) return 'success'
      if (complexity <= 10) return 'warning'
      return 'danger'
    }
  }
}
</script>