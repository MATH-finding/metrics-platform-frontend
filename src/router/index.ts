import { createRouter, createWebHistory } from 'vue-router'
import CKMetricsView from '../views/ck/CKMetricsView.vue'
import LKMetricsView from '../views/lk/LKMetricsView.vue'
import FPMetricsView from '../views/lk/FPMetricsView.vue'
import ParserView from '../views/parser/ParserView.vue'

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
      component: ParserView,
      meta: { title: '代码解析与度量' }
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