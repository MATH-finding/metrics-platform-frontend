<template>
  <div ref="chartEl" style="width:100%;height:300px"></div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'LocBarChart',
  props: {
    data: { type: Array, default: () => [] }
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
      const top20 = [...this.data].sort((a, b) => b.value - a.value).slice(0, 20)
      this.chart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: 120, right: 20, top: 20, bottom: 40 },
        xAxis: { type: 'value', name: 'LOC' },
        yAxis: { type: 'category', data: top20.map(d => d.className || d.packageName || ''), axisLabel: { fontSize: 11 } },
        series: [{ type: 'bar', data: top20.map(d => d.value), itemStyle: { color: '#667eea' } }]
      })
    },
    forceRender() { this.$nextTick(() => { setTimeout(() => { this.chart?.resize(); this.initChart() }, 100) }) }
  }
}
</script>
