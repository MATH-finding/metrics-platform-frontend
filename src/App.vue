<template>
  <el-config-provider :locale="zhCn">
    <el-container class="app-container">
      <!-- 侧边栏 -->
      <el-aside width="220px" class="sidebar">
        <div class="logo">
          <span class="logo-icon">📊</span>
          <span class="logo-text">软件度量平台</span>
        </div>
        <el-menu
            :default-active="$route.path"
            router
            class="sidebar-menu"
            background-color="#1a1a2e"
            text-color="#a0a0b0"
            active-text-color="#667eea"
        >
          <el-menu-item index="/dashboard">
            <el-icon><DataAnalysis /></el-icon>
            <span>综合仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/config">
            <el-icon><Setting /></el-icon>
            <span>项目配置</span>
          </el-menu-item>
          <el-menu-item index="/parser">
            <el-icon><Folder /></el-icon>
            <span>代码解析</span>
          </el-menu-item>
          <el-menu-item index="/ck-metrics">
            <el-icon><DataLine /></el-icon>
            <span>CK度量</span>
          </el-menu-item>
          <el-menu-item index="/lk-metrics">
            <el-icon><DataAnalysis /></el-icon>
            <span>LK度量</span>
          </el-menu-item>
          <el-menu-item index="/fp-metrics">
            <el-icon><PieChart /></el-icon>
            <span>功能点度量</span>
          </el-menu-item>
          <el-menu-item index="/ucp">
            <el-icon><Document /></el-icon>
            <span>UCP度量</span>
          </el-menu-item>
          <el-menu-item index="/effort">
            <el-icon><Timer /></el-icon>
            <span>工作量跟踪</span>
          </el-menu-item>
          <el-menu-item index="/smells">
            <el-icon><Warning /></el-icon>
            <span>坏味道检测</span>
          </el-menu-item>
          <el-menu-item index="/report">
            <el-icon><Printer /></el-icon>
            <span>报告生成</span>
          </el-menu-item>
          <el-menu-item index="/compare">
            <el-icon><TrendCharts /></el-icon>
            <span>对比分析</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <!-- 顶部栏 -->
        <el-header class="header">
          <div class="breadcrumb">
            <span class="page-title">{{ $route.meta.title }}</span>
          </div>
          <div class="header-actions">
            <el-button size="small" @click="refreshData" :loading="loading">
              <el-icon><Refresh /></el-icon>
              刷新数据
            </el-button>
          </div>
        </el-header>

        <!-- 主内容 -->
        <el-main class="main-content">
          <router-view v-if="!loading" />
          <div v-else class="loading-container">
            <el-icon class="is-loading" :size="40"><Loading /></el-icon>
            <p>加载中...</p>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </el-config-provider>
</template>

<script setup lang="ts">
import { DataAnalysis, Setting, Document, Timer, Warning, Printer, Refresh, Loading, DataLine, PieChart, Folder, TrendCharts } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
// import api from './services/api'

const router = useRouter()
const loading = ref(false)

const refreshData = () => {
  loading.value = true
  setTimeout(() => loading.value = false, 500)
}

onMounted(() => {
  console.log('🎉 D模块前端已启动！')
})
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif; }

.app-container { height: 100vh; }

.sidebar {
  background: #1a1a2e;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
}
.logo {
  padding: 24px 16px;
  text-align: center;
  border-bottom: 1px solid #2a2a4a;
}
.logo-icon { font-size: 2em; display: block; }
.logo-text { font-size: 0.9em; color: #667eea; font-weight: bold; margin-top: 5px; display: block; }

.sidebar-menu { border-right: none; }
.el-menu-item { margin: 4px 8px; border-radius: 8px; }
.el-menu-item.is-active { background: rgba(102, 126, 234, 0.15) !important; }

.header {
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.page-title { font-size: 1.2em; font-weight: 600; color: #333; }
.header-actions { display: flex; gap: 12px; align-items: center; }

.main-content { background: #f5f7fa; padding: 24px; }
.loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 400px; color: #999; }
</style>