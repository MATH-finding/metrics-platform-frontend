<template>
  <div>
    <el-card v-if="selectedMethod" shadow="hover" style="margin-bottom: 16px;">
      <template #header>
        <span style="font-weight: 500;">
          选中方法: {{ selectedMethod.className }}.{{ selectedMethod.name }}
        </span>
      </template>

      <el-descriptions :column="2" border v-if="selectedMethod.halsteadMetrics">
        <el-descriptions-item label="唯一操作符 (n1)">
          {{ selectedMethod.halsteadMetrics.uniqueOperators }}
        </el-descriptions-item>
        <el-descriptions-item label="唯一操作数 (n2)">
          {{ selectedMethod.halsteadMetrics.uniqueOperands }}
        </el-descriptions-item>

        <el-descriptions-item label="总操作符 (N1)">
          {{ selectedMethod.halsteadMetrics.totalOperators }}
        </el-descriptions-item>
        <el-descriptions-item label="总操作数 (N2)">
          {{ selectedMethod.halsteadMetrics.totalOperands }}
        </el-descriptions-item>

        <el-descriptions-item label="词汇量 (n)">
          <el-tag type="info">{{ selectedMethod.halsteadMetrics.vocabulary }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="长度 (N)">
          <el-tag type="info">{{ selectedMethod.halsteadMetrics.length }}</el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="体积 (V)">
          <el-tag type="success">{{ selectedMethod.halsteadMetrics.volume.toFixed(2) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="难度 (D)">
          <el-tag type="warning">{{ selectedMethod.halsteadMetrics.difficulty.toFixed(2) }}</el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="工作量 (E)" :span="2">
          <el-tag type="danger" size="large">
            {{ selectedMethod.halsteadMetrics.effort.toFixed(2) }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <el-empty v-else description="该方法无Halstead度量数据" />
    </el-card>

    <el-card shadow="hover">
      <template #header>
        <span style="font-weight: 500;">所有方法Halstead度量</span>
      </template>

      <el-table :data="halsteadTableData" stripe border max-height="500">
        <el-table-column prop="method" label="方法" width="250" fixed />
        <el-table-column prop="volume" label="体积(V)" width="100" sortable />
        <el-table-column prop="difficulty" label="难度(D)" width="100" sortable />
        <el-table-column prop="effort" label="工作量(E)" width="120" sortable>
          <template #default="scope">
            <el-tag :type="getEffortType(scope.row.effortRaw)" size="small">
              {{ scope.row.effort }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="vocabulary" label="词汇量(n)" width="100" />
        <el-table-column prop="length" label="长度(N)" width="100" />
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'HalsteadPanel',
  props: {
    data: {
      type: Object,
      default: null
    },
    selectedMethod: {
      type: Object,
      default: null
    }
  },
  computed: {
    halsteadTableData() {
      if (!this.data) return []

      const result = []
      for (const [methodName, metrics] of Object.entries(this.data)) {
        result.push({
          method: methodName,
          volume: metrics.volume.toFixed(2),
          difficulty: metrics.difficulty.toFixed(2),
          effort: metrics.effort.toFixed(2),
          effortRaw: metrics.effort,
          vocabulary: metrics.vocabulary,
          length: metrics.length
        })
      }

      return result.sort((a, b) => b.effortRaw - a.effortRaw)
    }
  },
  methods: {
    getEffortType(effort) {
      if (effort < 100) return 'success'
      if (effort < 500) return 'warning'
      return 'danger'
    }
  }
}
</script>