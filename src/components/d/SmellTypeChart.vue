<template>
  <div ref="chartEl" style="width:100%;height:280px"></div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'SmellTypeChart',
  props: { data: { type: Object, default: () => ({}) } },
  data() { return { chart: null } },
  mounted() { this.$nextTick(() => this.initChart()) },
  beforeUnmount() { this.chart?.dispose() },
  watch: { data() { this.$nextTick(() => { setTimeout(() => this.initChart(), 100) }) } },
  methods: {
    initChart() {
      if (!this.$refs.chartEl || this.$refs.chartEl.clientWidth === 0) return
      if (!this.chart) this.chart = echarts.init(this.$refs.chartEl)
      const keys = Object.keys(this.data)
      this.chart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: 150, right: 20, top: 20, bottom: 30 },
        xAxis: { type: 'value' },
        yAxis: { type: 'category', data: keys, axisLabel: { fontSize: 11 } },
        series: [{ type: 'bar', data: keys.map(k => this.data[k]), itemStyle: { color: '#667eea' } }]
      })
    },
    forceRender() { this.$nextTick(() => { setTimeout(() => { this.chart?.resize(); this.initChart() }, 100) }) }
  }
}
</script>
