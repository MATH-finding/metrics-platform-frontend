<template>
  <div>
    <!-- 添加滚动容器 -->
    <div style="overflow-x: auto; overflow-y: hidden;">
      <div ref="chart" :style="chartStyle"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'ComplexityChart',
  props: {
    data: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      chart: null,
      chartStyle: {
        width: '100%',
        minWidth: '1000px',  // ✅ 设置最小宽度
        height: '600px'       // ✅ 增加高度
      }
    }
  },
  mounted() {
    this.initChart()
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.dispose()
    }
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    initChart() {
      if (!this.data) return

      this.chart = echarts.init(this.$refs.chart)

      const methodData = []
      this.data.classes.forEach(cls => {
        cls.methods.forEach(method => {
          methodData.push({
            name: `${cls.className}.${method.name}`,
            className: cls.className,
            methodName: method.name,
            complexity: method.cyclomaticComplexity,
            codeLines: method.codeLines
          })
        })
      })

      // 按复杂度排序
      methodData.sort((a, b) => b.complexity - a.complexity)

      // ✅ 动态计算图表宽度
      const minWidth = Math.max(methodData.length * 80, 1000)
      this.chartStyle.minWidth = `${minWidth}px`

      const option = {
        title: {
          text: '方法圈复杂度分布',
          left: 'center',
          textStyle: {
            fontSize: 18,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params) => {
            const data = params[0]
            const item = methodData[data.dataIndex]
            return `
              <div style="padding: 8px;">
                <div style="font-weight: bold; margin-bottom: 4px;">
                  ${item.className}
                </div>
                <div style="margin-bottom: 4px;">
                  方法: ${item.methodName}
                </div>
                <div style="color: #F56C6C; font-weight: bold;">
                  圈复杂度: ${item.complexity}
                </div>
                <div>
                  代码行数: ${item.codeLines}
                </div>
              </div>
            `
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',  // ✅ 增加底部空间
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: methodData.map(m => m.methodName),  // ✅ 只显示方法名
          axisLabel: {
            rotate: 45,           // ✅ 旋转45度
            interval: 0,          // ✅ 显示所有标签
            fontSize: 11,         // ✅ 字体大小
            formatter: (value) => {
              // ✅ 超过15个字符截断
              return value.length > 15 ? value.substring(0, 15) + '...' : value
            }
          },
          axisLine: {
            lineStyle: {
              color: '#666'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '圈复杂度',
          nameTextStyle: {
            fontSize: 13,
            fontWeight: 'bold'
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#666'
            }
          },
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          }
        },
        series: [
          {
            name: '复杂度',
            type: 'bar',
            data: methodData.map(m => m.complexity),
            barWidth: '60%',  // ✅ 设置柱子宽度
            itemStyle: {
              color: (params) => {
                const value = params.value
                if (value <= 5) return '#67C23A'      // 绿色：低复杂度
                if (value <= 10) return '#E6A23C'     // 橙色：中等复杂度
                if (value <= 15) return '#F56C6C'     // 红色：高复杂度
                return '#C71585'                      // 深红：极高复杂度
              },
              borderRadius: [5, 5, 0, 0]  // ✅ 圆角
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            markLine: {
              silent: true,
              lineStyle: {
                type: 'dashed'
              },
              data: [
                {
                  yAxis: methodData.reduce((sum, m) => sum + m.complexity, 0) / methodData.length,
                  name: '平均值',
                  label: {
                    formatter: '平均值: {c}',
                    position: 'insideEndTop'
                  },
                  lineStyle: {
                    color: '#409EFF',
                    width: 2
                  }
                },
                {
                  yAxis: 10,
                  name: '警戒线',
                  label: {
                    formatter: '警戒线: {c}',
                    position: 'insideEndBottom'
                  },
                  lineStyle: {
                    color: '#F56C6C',
                    width: 2
                  }
                }
              ]
            },
            // ✅ 添加数据标签
            label: {
              show: true,
              position: 'top',
              formatter: '{c}',
              fontSize: 10,
              color: '#333'
            }
          }
        ],
        // ✅ 添加数据区域缩放
        dataZoom: [
          {
            type: 'slider',
            show: methodData.length > 20,  // 超过20个方法时显示
            bottom: 10,
            height: 20,
            start: 0,
            end: methodData.length > 20 ? 50 : 100
          },
          {
            type: 'inside'  // 支持鼠标滚轮缩放
          }
        ]
      }

      this.chart.setOption(option)
    },

    refresh() {
      if (this.chart) {
        this.chart.resize()
      }
      this.initChart()
    },

    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    }
  },
  watch: {
    data: {
      handler() {
        this.initChart()
      },
      deep: true
    }
  }
}
</script>

<style scoped>
/* 添加滚动条样式 */
div::-webkit-scrollbar {
  height: 8px;
}

div::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

div::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

div::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>