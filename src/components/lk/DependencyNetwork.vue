<template>
  <div style="width:100%;">
    <div ref="chartDom" style="width:100%; height:600px;"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'DependencyNetwork',
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

      const nodes = this.data.map(d => ({
        name: d.className,
        // 放大基础节点大小：原先除以10太小，现在基础大小设为30，按比例放大
        symbolSize: Math.max((d.size1 / 5) + 20, 30), 
        value: d.size1,
        category: 0
      }))

      const links = []
      // 根据 mpc 的大小绘制模拟边的粗细
      for (let i = 0; i < nodes.length; i++) {
        const targetIdx = (i + 1) % nodes.length
        if (this.data[i].mpc > 0) {
          links.push({
            source: nodes[i].name,
            target: nodes[targetIdx].name,
            lineStyle: { width: Math.max(1, this.data[i].mpc / 2) }
          })
        }
      }

      const option = {
        tooltip: {},
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        series: [{
          type: 'graph',
          layout: 'circular',
          circular: {
            rotateLabel: true
          },
          data: nodes,
          links: links,
          roam: true, // 允许缩放和拖拽
          // 增加图形距离容器边缘的距离，防止节点被切断或整体太小
          top: '15%',
          bottom: '15%',
          left: '15%',
          right: '15%',
          label: { 
            position: 'right', 
            formatter: '{b}', 
            show: true,
            fontSize: 14 // 稍微放大字体
          },
          lineStyle: { color: 'source', curveness: 0.3 },
          emphasis: { focus: 'adjacency', lineStyle: { width: 5 } }
        }]
      }
      this.chart.setOption(option)
    }
  }
}
</script>