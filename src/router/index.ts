import { createRouter, createWebHistory } from 'vue-router'
import CKMetricsView from '../views/ck/CKMetricsView.vue'
import LKMetricsView from '../views/lk/LKMetricsView.vue'
import FPMetricsView from '../views/lk/FPMetricsView.vue'
import ParserView from '../views/parser/ParserView.vue'
import DashboardView from '../views/d/DashboardView.vue'
import ConfigView from '../views/d/ConfigView.vue'
import UCPView from '../views/d/UCPView.vue'
import EffortView from '../views/d/EffortView.vue'
import SmellsView from '../views/d/SmellsView.vue'
import ReportView from '../views/d/ReportView.vue'
import CompareView from '../views/d/CompareView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: DashboardView,
      meta: { title: '综合仪表盘' }
    },
    {
      path: '/parser',
      name: 'Parser',
      component: ParserView,
      meta: { title: '代码解析与度量' }
    },
    {
      path: '/config',
      name: 'Config',
      component: ConfigView,
      meta: { title: '项目配置' }
    },
    {
      path: '/ucp',
      name: 'UCP',
      component: UCPView,
      meta: { title: 'UCP度量' }
    },
    {
      path: '/effort',
      name: 'Effort',
      component: EffortView,
      meta: { title: '工作量跟踪' }
    },
    {
      path: '/smells',
      name: 'Smells',
      component: SmellsView,
      meta: { title: '坏味道检测' }
    },
    {
      path: '/report',
      name: 'Report',
      component: ReportView,
      meta: { title: '报告生成' }
    },
    {
      path: '/compare',
      name: 'Compare',
      component: CompareView,
      meta: { title: '对比分析' }
    },
    {
      path: '/ck-metrics',
      name: 'CKMetrics',
      component: CKMetricsView,
      meta: { title: 'CK度量分析' }
    },
    {
      path: '/lk-metrics',
      name: 'LKMetrics',
      component: LKMetricsView,
      meta: { title: 'LK度量分析' }
    },
    {
      path: '/fp-metrics',
      name: 'FPMetrics',
      component: FPMetricsView,
      meta: { title: 'FP度量分析' }
    }
  ]
})

export default router