<template>
  <div>
    <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
      <el-input
        v-model="searchText"
        placeholder="搜索类名..."
        style="width: 240px"
        clearable
      />
      <el-button type="success" @click="exportCSV">导出 CSV</el-button>
    </div>

    <el-table
      :data="filteredData"
      border
      stripe
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="45" />

      <el-table-column prop="className" label="类名" min-width="160" sortable>
        <template #default="{ row }">
          <el-button link type="primary" @click="$emit('select', row)">
            {{ row.className }}
          </el-button>
        </template>
      </el-table-column>

      <el-table-column prop="packageName" label="包名" min-width="180" show-overflow-tooltip />

      <el-table-column prop="wmc" label="WMC" width="90" sortable>
        <template #default="{ row }">
          <el-tag :type="row.wmcHigh ? 'danger' : 'success'" size="small">
            {{ row.wmc }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="dit" label="DIT" width="90" sortable>
        <template #default="{ row }">
          <el-tag :type="row.ditHigh ? 'danger' : 'success'" size="small">
            {{ row.dit }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="noc" label="NOC" width="90" sortable>
        <template #default="{ row }">
          <el-tag type="info" size="small">{{ row.noc }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="cbo" label="CBO" width="90" sortable>
        <template #default="{ row }">
          <el-tag :type="row.cboHigh ? 'danger' : 'success'" size="small">
            {{ row.cbo }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="rfc" label="RFC" width="90" sortable>
        <template #default="{ row }">
          <el-tag :type="row.rfcHigh ? 'danger' : 'success'" size="small">
            {{ row.rfc }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="lcom" label="LCOM" width="90" sortable>
        <template #default="{ row }">
          <el-tag :type="row.lcomHigh ? 'danger' : 'success'" size="small">
            {{ row.lcom }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <div style="margin-top: 10px; font-size: 12px; color: #909399;">
      阈值说明：WMC &gt; 50 / DIT &gt; 5 / CBO &gt; 14 / RFC &gt; 50 / LCOM &gt; 1 标红预警
    </div>
  </div>
</template>

<script>
export default {
  name: 'CKTable',
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  emits: ['select', 'selectionChange'],
  data() {
    return {
      searchText: '',
      selectedRows: []
    }
  },
  computed: {
    filteredData() {
      if (!this.searchText) return this.data
      return this.data.filter(item =>
        item.className.toLowerCase().includes(this.searchText.toLowerCase())
      )
    }
  },
  methods: {
    handleSelectionChange(rows) {
      this.selectedRows = rows
      this.$emit('selectionChange', rows)
    },
    exportCSV() {
      const headers = ['类名', '包名', 'WMC', 'DIT', 'NOC', 'CBO', 'RFC', 'LCOM']
      const rows = this.data.map(r =>
        [r.className, r.packageName, r.wmc, r.dit, r.noc, r.cbo, r.rfc, r.lcom].join(',')
      )
      const csv = [headers.join(','), ...rows].join('\n')
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'ck-metrics.csv'
      a.click()
      URL.revokeObjectURL(url)
    }
  }
}
</script>