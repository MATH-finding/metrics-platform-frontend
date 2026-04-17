<template>
  <div style="padding: 24px;">
    <div style="margin-bottom: 20px;">
      <span style="font-size: 20px; font-weight: 500;">FP 功能点估算分析</span>
      <el-button type="primary" style="margin-left: 16px;" :loading="loading" @click="loadData">
        {{ loading ? '计算中...' : '开始估算' }}
      </el-button>
    </div>

    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" style="margin-bottom: 16px;" />

    <el-card shadow="never" style="margin-bottom: 20px;">
      <div style="margin-bottom: 10px; color: #606266; font-size: 14px;">
        <el-icon style="vertical-align: middle; margin-right: 5px;"><InfoFilled /></el-icon>
        基于代码解析自动提取内部逻辑文件(ILF)、外部接口文件(EIF)、外部输入(EI)、外部输出(EO)和外部查询(EQ)。
      </div>
    </el-card>

    <FpPanel :data="fpData" v-loading="loading" />

  </div>
</template>

<script>
import { fetchFPMetrics } from '@/api/lkApi.js'
import FpPanel from '@/components/lk/FpPanel.vue'
import { InfoFilled } from '@element-plus/icons-vue'

export default {
  name: 'FPMetricsView',
  components: { FpPanel, InfoFilled },
  data() {
    return {
      loading: false,
      error: null,
      fpData: null
    }
  },
  methods: {
    async loadData() {
      this.loading = true
      this.error = null
      try {
        const fpRes = await fetchFPMetrics()
        // 兼容不同的后端返回结构
        const fpReport = fpRes.data.data || fpRes.data
        // 如果后端返回的是包含 fpMetrics 的报告对象，则取 fpMetrics；如果是直接返回的 FpMetricResult，则直接使用
        this.fpData = fpReport.fpMetrics ? fpReport.fpMetrics : fpReport
      } catch (e) {
        this.error = '请求失败，请确认后端服务已启动且/api/fp接口可用'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>