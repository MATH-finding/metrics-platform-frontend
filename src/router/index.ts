import { createRouter, createWebHistory } from 'vue-router'
import CKMetricsView from '../views/ck/CKMetricsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/ck-metrics'
    },
    {
      path: '/ck-metrics',
      name: 'CKMetrics',
      component: CKMetricsView,
      meta: { title: 'CK度量分析' }
    }
  ]
})

export default router