<template>
  <div ref="chartEl" style="width:100%;height:280px"></div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'SmellSeverityChart',
  props: { data: { type: Object, default: () => ({}) } },
  data() { return { chart: null } },
  mounted() { this.$nextTick(() => this.initChart()) },
  beforeUnmount() { this.chart?.dispose() },
  watch: { data() { this.$nextTick(() => { setTimeout(() => this.initChart(), 100) }) } },
  methods: {
    initChart() {
      if (!this.$refs.chartEl || this.$refs.chartEl.clientWidth === 0) return
      if (!this.chart) this.chart = echarts.init(this.$refs.chartEl)
      const colorMap = { HIGH: '#f5576c', MEDIUM: '#f09a3e', LOW: '#43e97b' }
      const keys = Object.keys(this.data)
      this.chart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { bottom: 0 },
        series: [{
          type: 'pie',
          radius: ['40%', '65%'],
          data: keys.map(k => ({ name: k, value: this.data[k], itemStyle: { color: colorMap[k] || '#667eea' } }))
        }]
      })
    },
    forceRender() { this.$nextTick(() => { setTimeout(() => { this.chart?.resize(); this.initChart() }, 100) }) }
  }
}
</script>
