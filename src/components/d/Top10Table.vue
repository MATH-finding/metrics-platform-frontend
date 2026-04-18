<template>
  <div>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="最复杂的类" name="complex">
        <el-table :data="complexList" border stripe size="small" style="width:100%">
          <el-table-column prop="className" label="类名" min-width="180" show-overflow-tooltip />
          <el-table-column prop="packageName" label="包名" min-width="160" show-overflow-tooltip />
          <el-table-column prop="cyclomaticComplexity" label="圈复杂度" width="100" sortable />
          <el-table-column prop="codeLines" label="代码行" width="90" sortable />
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="最大的类" name="size">
        <el-table :data="sizeList" border stripe size="small" style="width:100%">
          <el-table-column prop="className" label="类名" min-width="180" show-overflow-tooltip />
          <el-table-column prop="packageName" label="包名" min-width="160" show-overflow-tooltip />
          <el-table-column prop="codeLines" label="代码行" width="90" sortable />
          <el-table-column prop="methodCount" label="方法数" width="90" sortable />
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="最高耦合的类" name="coupling">
        <el-table :data="couplingList" border stripe size="small" style="width:100%">
          <el-table-column prop="className" label="类名" min-width="180" show-overflow-tooltip />
          <el-table-column prop="packageName" label="包名" min-width="160" show-overflow-tooltip />
          <el-table-column prop="cbo" label="CBO" width="80" sortable />
          <el-table-column prop="rfc" label="RFC" width="80" sortable />
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: 'Top10Table',
  props: {
    complexList: { type: Array, default: () => [] },
    sizeList: { type: Array, default: () => [] },
    couplingList: { type: Array, default: () => [] }
  },
  data() { return { activeTab: 'complex' } }
}
</script>
