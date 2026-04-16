<template>
  <div style="width:100%;">
    <div v-if="selectedClasses.length === 0"
         style="text-align:center; color:#909399; padding: 60px 0;">
      请在表格中勾选类（最多5个）以显示雷达图对比
    </div>
    <div v-show="selectedClasses.length > 0"
         ref="chartDom"
         style="width:100%; height:500px;">
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'CKRadarChart',
  props: {
    selectedClasses: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return { chart: null }
  },
  watch: {
    selectedClasses: {
      deep: true,
      handler(val) {
        if (val.length > 0) {
          this.$nextTick(() => setTimeout(() => this.renderChart(), 100))
        }
      }
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
    if (this.chart) this.chart.dispose()
  },
  methods: {
    handleResize() {
      if (this.chart) this.chart.resize()
    },
    forceRender() {
      if (this.selectedClasses.length === 0) return
      if (this.chart) {
        this.chart.resize()
      } else {
        this.renderChart()
      }
    },
    normalize(value, max) {
      return Math.max(0, Math.round((1 - Math.min(value, max) / max) * 100))
    },
    renderChart() {
      if (!this.$refs.chartDom) return
      if (this.chart) { this.chart.dispose(); this.chart = null }

      this.chart = echarts.init(this.$refs.chartDom)

      const colorPalette = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']

      const seriesData = this.selectedClasses.map((cls, i) => ({
        name: cls.className,
        value: [
          this.normalize(cls.wmc, 50),
          this.normalize(cls.dit, 5),
          this.normalize(cls.noc, 10),
          this.normalize(cls.cbo, 14),
          this.normalize(cls.rfc, 50),
          this.normalize(cls.lcom, 3)
        ],
        lineStyle: { color: colorPalette[i], width: 2 },
        areaStyle: { color: colorPalette[i], opacity: 0.15 },
        itemStyle: { color: colorPalette[i] }
      }))

      this.chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            const cls = this.selectedClasses.find(c => c.className === params.name)
            if (!cls) return ''
            return `<b>${cls.className}</b><br/>
              WMC: ${cls.wmc}<br/>
              DIT: ${cls.dit}<br/>
              NOC: ${cls.noc}<br/>
              CBO: ${cls.cbo}<br/>
              RFC: ${cls.rfc}<br/>
              LCOM: ${cls.lcom}`
          }
        },
        legend: {
          data: this.selectedClasses.map(c => c.className),
          bottom: 10,
          itemGap: 24,
          textStyle: { fontSize: 13 }
        },
        radar: {
          indicator: [
            { name: 'WMC\n越高越复杂', max: 100 },
            { name: 'DIT\n越深越难理解', max: 100 },
            { name: 'NOC\n子类数', max: 100 },
            { name: 'CBO\n越高耦合越强', max: 100 },
            { name: 'RFC\n越高响应越复杂', max: 100 },
            { name: 'LCOM\n越高内聚越差', max: 100 }
          ],
          radius: '62%',
          center: ['50%', '48%'],
          axisName: {
            fontSize: 13,
            color: '#303133'
          },
          splitNumber: 4,
          axisLine: { lineStyle: { color: '#dde' } },
          splitLine: { lineStyle: { color: '#eef' } },
          splitArea: { areaStyle: { color: ['#f8f9ff', '#fff'] } }
        },
        series: [{
          type: 'radar',
          data: seriesData,
          emphasis: { lineStyle: { width: 3 } }
        }]
      })

      this.chart.resize()
    }
  }
}
</script>