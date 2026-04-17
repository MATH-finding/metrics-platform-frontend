<template>
  <div>
    <el-alert
        v-if="!hasValidData"
        title="暂无依赖关系数据"
        type="info"
        :closable="false"
        style="margin-bottom: 16px;"
    />

    <div v-else>
      <!-- 显示统计信息 -->
      <el-card shadow="hover" style="margin-bottom: 16px;">
        <el-descriptions :column="4" size="small">
          <el-descriptions-item label="类数量">
            {{ nodeCount }}
          </el-descriptions-item>
          <el-descriptions-item label="依赖关系">
            {{ linkCount }}
          </el-descriptions-item>
          <el-descriptions-item label="继承关系">
            {{ inheritanceCount }}
          </el-descriptions-item>
          <el-descriptions-item label="接口实现">
            {{ interfaceCount }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <div ref="chart" style="width: 100%; height: 600px; border: 1px solid #e4e7ed;"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'DependencyGraph',
  props: {
    data: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      chart: null,
      nodeCount: 0,
      linkCount: 0,
      inheritanceCount: 0,
      interfaceCount: 0
    }
  },
  computed: {
    hasValidData() {
      return this.data &&
          this.data.classes &&
          this.data.classes.length > 0
    }
  },
  mounted() {
    this.initChart()
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.dispose()
    }
  },
  methods: {
    initChart() {
      if (!this.hasValidData) {
        console.warn('没有有效的依赖数据')
        return
      }

      this.chart = echarts.init(this.$refs.chart)

      // 构建节点
      const nodes = []
      const nodeSet = new Set()

      this.data.classes.forEach(cls => {
        const nodeName = cls.className
        nodeSet.add(nodeName)

        nodes.push({
          id: nodeName,
          name: nodeName,
          value: cls.methods.length,
          category: this.getNodeCategory(cls),
          symbolSize: this.calculateNodeSize(cls),
          label: {
            show: true,
            formatter: cls.className
          },
          itemStyle: {
            borderWidth: 2,
            borderColor: '#fff',
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        })
      })

      // ✅ 构建依赖关系连线
      const links = this.buildLinks()

      // 更新统计信息
      this.nodeCount = nodes.length
      this.linkCount = links.length
      this.inheritanceCount = links.filter(l => l.type === 'extends').length
      this.interfaceCount = links.filter(l => l.type === 'implements').length

      console.log('节点数量:', nodes.length)
      console.log('连线数量:', links.length)
      console.log('依赖数据:', this.data.dependencies)

      const categories = [
        {
          name: '普通类',
          itemStyle: { color: '#67C23A' }
        },
        {
          name: '抽象类',
          itemStyle: { color: '#E6A23C' }
        },
        {
          name: '接口',
          itemStyle: { color: '#409EFF' }
        }
      ]

      const option = {
        title: {
          text: '类依赖关系图',
          subtext: `${nodes.length}个类，${links.length}个依赖关系`,
          left: 'center',
          textStyle: {
            fontSize: 18,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          formatter: (params) => {
            if (params.dataType === 'node') {
              return `
                <div style="padding: 8px;">
                  <div style="font-weight: bold; margin-bottom: 4px;">
                    ${params.data.name}
                  </div>
                  <div>类型: ${params.data.category}</div>
                  <div>方法数: ${params.data.value}</div>
                </div>
              `
            } else if (params.dataType === 'edge') {
              return `
                <div style="padding: 8px;">
                  <div style="font-weight: bold; margin-bottom: 4px;">
                    ${params.data.source} → ${params.data.target}
                  </div>
                  <div>关系类型: ${params.data.type}</div>
                </div>
              `
            }
          }
        },
        legend: {
          data: categories.map(c => c.name),
          orient: 'vertical',
          left: 'left',
          top: '15%'
        },
        series: [{
          type: 'graph',
          layout: 'force',
          data: nodes,
          links: links,
          categories: categories,
          roam: true,
          draggable: true,
          label: {
            show: true,
            position: 'right',
            formatter: '{b}',
            fontSize: 12
          },
          edgeLabel: {
            show: true,
            fontSize: 10,
            formatter: '{c}'
          },
          edgeSymbol: ['none', 'arrow'],  // ✅ 关键：添加箭头
          edgeSymbolSize: [0, 10],        // ✅ 箭头大小
          labelLayout: {
            hideOverlap: true
          },
          force: {
            repulsion: 800,        // ✅ 增加斥力
            gravity: 0.1,          // ✅ 减少引力
            edgeLength: [100, 200], // ✅ 边的长度范围
            layoutAnimation: true
          },
          lineStyle: {
            color: 'source',       // ✅ 连线颜色跟随源节点
            width: 2,              // ✅ 增加线宽
            curveness: 0.3         // ✅ 曲线弯曲度
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 4
            },
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      }

      this.chart.setOption(option)
    },

    /**
     * ✅ 构建依赖关系连线
     */
    buildLinks() {
      const links = []
      const processedLinks = new Set()

      if (!this.data.dependencies || this.data.dependencies.length === 0) {
        console.warn('没有依赖数据')
        return links
      }

      // 处理显式依赖
      this.data.dependencies.forEach(dep => {
        const from = dep.from
        const to = dep.to

        // 过滤条件
        if (from === to) return  // 自己依赖自己
        if (to.startsWith('java.')) return  // Java标准库
        if (to.startsWith('javax.')) return
        if (to.includes('String')) return  // 基本类型
        if (to.includes('int') || to.includes('boolean') || to.includes('void')) return

        const linkKey = `${from}-${to}-${dep.type}`

        if (!processedLinks.has(linkKey)) {
          processedLinks.add(linkKey)

          links.push({
            source: from,
            target: to,
            type: dep.type,
            value: dep.type,
            lineStyle: {
              type: this.getLinkLineStyle(dep.type),
              width: this.getLinkWidth(dep.type)
            }
          })
        }
      })

      // ✅ 添加继承关系
      if (this.data.inheritanceTree) {
        Object.entries(this.data.inheritanceTree).forEach(([className, node]) => {
          if (node.parent && node.parent !== 'Object') {
            const linkKey = `${className}-${node.parent}-extends`

            if (!processedLinks.has(linkKey)) {
              processedLinks.add(linkKey)

              links.push({
                source: className,
                target: node.parent,
                type: 'extends',
                value: 'extends',
                lineStyle: {
                  type: 'solid',
                  width: 3,
                  color: '#E6A23C'
                }
              })
            }
          }
        })
      }

      // ✅ 添加接口实现关系
      this.data.classes.forEach(cls => {
        if (cls.interfaces && cls.interfaces.length > 0) {
          cls.interfaces.forEach(interfaceName => {
            const linkKey = `${cls.className}-${interfaceName}-implements`

            if (!processedLinks.has(linkKey)) {
              processedLinks.add(linkKey)

              links.push({
                source: cls.className,
                target: interfaceName,
                type: 'implements',
                value: 'implements',
                lineStyle: {
                  type: 'dashed',
                  width: 2,
                  color: '#409EFF'
                }
              })
            }
          })
        }
      })

      console.log('构建的连线:', links)
      return links
    },

    /**
     * 获取节点分类
     */
    getNodeCategory(cls) {
      if (cls.interface) return '接口'
      if (cls.abstract) return '抽象类'
      return '普通类'
    },

    /**
     * 计算节点大小
     */
    calculateNodeSize(cls) {
      const baseSize = 40
      const sizePerMethod = 5
      return Math.min(baseSize + cls.methods.length * sizePerMethod, 100)
    },

    /**
     * 获取连线样式
     */
    getLinkLineStyle(type) {
      switch(type) {
        case 'extends':
          return 'solid'
        case 'implements':
          return 'dashed'
        case 'field':
          return 'dotted'
        default:
          return 'solid'
      }
    },

    /**
     * 获取连线宽度
     */
    getLinkWidth(type) {
      switch(type) {
        case 'extends':
          return 3
        case 'implements':
          return 2
        default:
          return 1
      }
    },

    refresh() {
      if (this.chart) {
        this.chart.resize()
      }
      this.initChart()
    }
  },
  watch: {
    data: {
      handler() {
        this.$nextTick(() => {
          this.initChart()
        })
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.el-descriptions {
  font-size: 13px;
}
</style>