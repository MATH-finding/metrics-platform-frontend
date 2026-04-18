<template>
  <div ref="chartEl" style="width:100%;height:300px"></div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'ComplexityPieChart',
  props: {
    data: { type: Object, default: () => ({}) }
  },
  data() { return { chart: null } },
  mounted() { this.$nextTick(() => this.initChart()) },
  beforeUnmount() { this.chart?.dispose() },
  watch: {
    data() { this.$nextTick(() => { setTimeout(() => this.initChart(), 100) }) }
  },
  methods: {
    initChart() {
      if (!this.$refs.chartEl || this.$refs.chartEl.clientWidth === 0) return
      if (!this.chart) this.chart = echarts.init(this.$refs.chartEl)
      const d = this.data
      const pieData = [
        { name: '低（<10）', value: d.low || 0, itemStyle: { color: '#43e97b' } },
        { name: '中（10-20）', value: d.medium || 0, itemStyle: { color: '#f6d365' } },
        { name: '高（20-50）', value: d.high || 0, itemStyle: { color: '#f09a3e' } },
        { name: '极高（>50）', value: d.veryHigh || 0, itemStyle: { color: '#f5576c' } },
      ].filter(x => x.value > 0)
      this.chart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { bottom: 0 },
        series: [{ type: 'pie', radius: ['40%', '70%'], data: pieData, label: { formatter: '{b}\n{d}%' } }]
      })
    },
    forceRender() { this.$nextTick(() => { setTimeout(() => { this.chart?.resize(); this.initChart() }, 100) }) }
  }
}
</script>
