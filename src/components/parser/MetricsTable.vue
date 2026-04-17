<template>
  <div>
    <el-table
        :data="tableData"
        stripe
        border
        style="width: 100%"
        @row-click="handleRowClick"
        @expand-change="handleExpandChange"
    >
      <el-table-column type="expand">
        <template #default="props">
          <div style="padding: 0 50px;">
            <h4 style="margin-bottom: 12px;">方法列表</h4>
            <el-table
                :data="props.row.methods"
                border
                size="small"
                @row-click="(row) => handleMethodClick(row, props.row)"
            >
              <el-table-column prop="name" label="方法名" width="200" />
              <el-table-column prop="returnType" label="返回类型" width="120" />
              <el-table-column label="参数" width="200">
                <template #default="scope">
                  {{ formatParameters(scope.row.parameters) }}
                </template>
              </el-table-column>
              <el-table-column prop="cyclomaticComplexity" label="复杂度" width="80">
                <template #default="scope">
                  <el-tag :type="getComplexityType(scope.row.cyclomaticComplexity)" size="small">
                    {{ scope.row.cyclomaticComplexity }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="codeLines" label="代码行" width="80" />
              <el-table-column label="Halstead" width="120">
                <template #default="scope">
                  <el-button
                      v-if="scope.row.halsteadMetrics"
                      size="small"
                      type="primary"
                      link
                      @click.stop="handleMethodClick(scope.row, props.row)"
                  >
                    查看详情
                  </el-button>
                  <span v-else style="color: #909399;">-</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="className" label="类名" width="200" />
      <el-table-column prop="packageName" label="包名" width="200" />
      <el-table-column label="方法数" width="80">
        <template #default="scope">
          {{ scope.row.methods.length }}
        </template>
      </el-table-column>
      <el-table-column prop="codeLines" label="代码行" width="80" />
      <el-table-column prop="commentLines" label="注释行" width="80" />
      <el-table-column label="注释率" width="100">
        <template #default="scope">
          {{ (scope.row.commentRate * 100).toFixed(2) }}%
        </template>
      </el-table-column>
      <el-table-column label="类型" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.interface" type="info" size="small">接口</el-tag>
          <el-tag v-else-if="scope.row.abstract" type="warning" size="small">抽象类</el-tag>
          <el-tag v-else type="success" size="small">普通类</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'MetricsTable',
  props: {
    data: {
      type: Object,
      default: null
    }
  },
  computed: {
    tableData() {
      return this.data?.classes || []
    }
  },
  methods: {
    handleRowClick(row) {
      this.$emit('class-select', row)
    },

    handleExpandChange(row, expandedRows) {
      console.log('展开行:', row.className)
    },

    handleMethodClick(method, classData) {
      this.$emit('method-select', {
        ...method,
        className: classData.className
      })
    },

    formatParameters(params) {
      if (!params || params.length === 0) return '()'
      return '(' + params.map(p => `${p.type} ${p.name}`).join(', ') + ')'
    },

    getComplexityType(complexity) {
      if (complexity <= 5) return 'success'
      if (complexity <= 10) return 'warning'
      return 'danger'
    }
  }
}
</script>

<style scoped>
.el-table :deep(.el-table__expand-icon) {
  font-size: 14px;
}
</style>