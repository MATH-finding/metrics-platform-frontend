<template>
  <div>
    <div style="margin-bottom: 16px; text-align: right;">
      <el-button type="success" size="small" @click="exportCSV">导出 CSV</el-button>
    </div>
    <el-table :data="data" border stripe style="width: 100%" height="500">
      <el-table-column prop="className" label="类名" width="200" show-overflow-tooltip sortable />
      <el-table-column prop="size1" label="SIZE1 (代码行)" sortable />
      <el-table-column prop="size2" label="SIZE2 (属性+方法)" sortable />
      <el-table-column prop="dac" label="DAC (数据抽象耦合)" sortable />
      <el-table-column prop="mpc" label="MPC (方法多态性)" sortable />
      <el-table-column prop="nom" label="NOM (方法数)" sortable />
      <el-table-column prop="aif" label="AIF (属性继承)" sortable>
        <template #default="{ row }">{{ (row.aif * 100).toFixed(2) }}%</template>
      </el-table-column>
      <el-table-column prop="mif" label="MIF (方法继承)" sortable>
        <template #default="{ row }">{{ (row.mif * 100).toFixed(2) }}%</template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'LKTable',
  props: { data: { type: Array, default: () => [] } },
  methods: {
    exportCSV() {
      if (!this.data || this.data.length === 0) return
      const headers = ['类名', 'SIZE1', 'SIZE2', 'DAC', 'MPC', 'NOM', 'AIF', 'MIF']
      const rows = this.data.map(row => [
        row.className, row.size1, row.size2, row.dac, row.mpc, row.nom, row.aif, row.mif
      ])
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'lk_metrics.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
}
</script>