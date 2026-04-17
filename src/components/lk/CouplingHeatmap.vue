<template>
  <div style="width:100%;">
    <div ref="chartDom" style="width:100%; height:600px;"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'CouplingHeatmap',
  props: { data: { type: Array, default: () => [] } },
  data() { return { chart: null } },
  watch: { 
    data: { 
      deep: true, 
      handler() { 
        this.$nextTick(() => {
          setTimeout(() => {
            this.renderChart()
          }, 300)
        })
      } 
    } 
  },
  mounted() { window.addEventListener('resize', this.handleResize) },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
    if (this.chart) this.chart.dispose()
  },
  methods: {
    handleResize() { if (this.chart) this.chart.resize() },
    forceRender() { 
      this.$nextTick(() => {
        if (this.chart) {
          this.chart.resize()
        } else {
          this.renderChart()
        }
      })
    },
    renderChart() {
      if (!this.$refs.chartDom || this.data.length === 0) return
      
      // 检查容器是否有有效宽度，防止在隐藏Tab中初始化导致缩成一团
      if (this.$refs.chartDom.clientWidth === 0) return;

      if (!this.chart) this.chart = echarts.init(this.$refs.chartDom)

      // 强制重置大小
      this.chart.resize()
      
      // 提取类名（截取前20个防止过于密集）
      const classes = this.data.map(d => d.className).slice(0, 20)
      const heatmapData = []
      
      // 模拟计算耦合矩阵（根据 DAC 和 MPC）
      for (let i = 0; i < classes.length; i++) {
        for (let j = 0; j < classes.length; j++) {
          if (i === j) {
            heatmapData.push([i, j, 0])
          } else {
            const c1 = this.data[i]; const c2 = this.data[j]
            let strength = ((c1.mpc + c2.dac) % 10)
            heatmapData.push([i, j, strength])
          }
        }
      }

      const option = {
        tooltip: { position: 'top' },
        grid: { height: '65%', top: '5%' },
        xAxis: { type: 'category', data: classes, splitArea: { show: true }, axisLabel: { rotate: 45 } },
        yAxis: { type: 'category', data: classes, splitArea: { show: true } },
        visualMap: { 
          min: 0, 
          max: 10, 
          calculable: true, 
          orient: 'horizontal', 
          left: 'center', 
          bottom: '0%',
          inRange: {
            color: ['#f5f5f5', '#667eea', '#e03e2d'] // 从浅灰 -> 蓝紫 -> 红色（热力效果）
          }
        },
        series: [{
          name: 'Coupling Strength', type: 'heatmap', data: heatmapData,
          label: { show: true },
          emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
        }]
      }
      this.chart.setOption(option)
    }
  }
}
</script>