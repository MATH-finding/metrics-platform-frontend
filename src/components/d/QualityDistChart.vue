<template>
  <div ref="chartEl" style="width:100%;height:300px"></div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'QualityDistChart',
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
      const colorMap = { A: '#43e97b', B: '#4facfe', C: '#f6d365', D: '#f5576c' }
      const grades = Object.keys(this.data)
      this.chart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: grades },
        yAxis: { type: 'value', name: '类数量' },
        series: [{
          type: 'bar',
          data: grades.map(g => ({ value: this.data[g], itemStyle: { color: colorMap[g] || '#667eea' } }))
        }]
      })
    },
    forceRender() { this.$nextTick(() => { setTimeout(() => { this.chart?.resize(); this.initChart() }, 100) }) }
  }
}
</script>
