<template>
  <div v-if="data">
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card shadow="hover">
          <div style="font-size:14px; color:#909399;">预估代码行 (LOC)</div>
          <div style="font-size:24px; font-weight:bold; margin-top:10px;">{{ data.estimatedLoc.toFixed(0) }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div style="font-size:14px; color:#909399;">预估工作量 (人月)</div>
          <div style="font-size:24px; font-weight:bold; margin-top:10px;">{{ data.estimatedPersonMonths.toFixed(2) }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div style="font-size:14px; color:#909399;">预估工期 (月)</div>
          <div style="font-size:24px; font-weight:bold; margin-top:10px;">{{ data.estimatedDurationMonths.toFixed(2) }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div style="font-size:14px; color:#909399;">预估成本 (元)</div>
          <div style="font-size:24px; font-weight:bold; margin-top:10px;">¥ {{ data.estimatedCost.toLocaleString() }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card header="功能点统计表">
          <el-table :data="tableData" border size="small">
            <el-table-column prop="type" label="功能类型" />
            <el-table-column prop="count" label="数量" />
            <el-table-column prop="weight" label="权重" />
            <el-table-column prop="score" label="未调整小计" />
          </el-table>
          <div style="margin-top: 15px; font-weight: bold; text-align: right;">
            未调整功能点总计 (UFP): {{ data.ufp.toFixed(2) }} <br/>
            调整后功能点总计 (FP): {{ data.fp.toFixed(2) }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card header="功能点分布">
          <div ref="pieChartDom" style="height: 250px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
  <div v-else style="text-align:center; padding: 40px; color:#909399;">
    暂无功能点数据
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'FpPanel',
  props: { data: { type: Object, default: null } },
  data() { return { chart: null } },
  computed: {
    tableData() {
      if (!this.data) return []
      return [
        { type: '外部输入 (EI)', count: this.data.ei, weight: 4, score: this.data.ei * 4 },
        { type: '外部输出 (EO)', count: this.data.eo, weight: 5, score: this.data.eo * 5 },
        { type: '外部查询 (EQ)', count: this.data.eq, weight: 4, score: this.data.eq * 4 },
        { type: '内部逻辑文件 (ILF)', count: this.data.ilf, weight: 10, score: this.data.ilf * 10 },
        { type: '外部接口文件 (EIF)', count: this.data.eif, weight: 7, score: this.data.eif * 7 }
      ]
    }
  },
  watch: { data: { deep: true, handler() { this.$nextTick(() => this.renderChart()) } } },
  mounted() {
    window.addEventListener('resize', this.handleResize)
    if (this.data) this.renderChart()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
    if (this.chart) this.chart.dispose()
  },
  methods: {
    handleResize() { if (this.chart) this.chart.resize() },
    renderChart() {
      if (!this.$refs.pieChartDom || !this.data) return
      if (!this.chart) this.chart = echarts.init(this.$refs.pieChartDom)

      const option = {
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [{
          name: '功能点类型', type: 'pie', radius: '70%',
          data: [
            { value: this.data.ei, name: 'EI' },
            { value: this.data.eo, name: 'EO' },
            { value: this.data.eq, name: 'EQ' },
            { value: this.data.ilf, name: 'ILF' },
            { value: this.data.eif, name: 'EIF' }
          ],
          emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
        }]
      }
      this.chart.setOption(option)
    }
  }
}
</script>