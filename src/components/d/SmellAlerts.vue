<template>
  <div>
    <el-alert
      v-for="smell in topSmells"
      :key="smell.id || smell.className + smell.type"
      :title="`[${smell.severity}] ${smell.type} — ${smell.className}`"
      :description="smell.description"
      :type="severityType(smell.severity)"
      show-icon
      :closable="false"
      style="margin-bottom:8px"
    />
    <el-empty v-if="!topSmells.length" description="暂无问题预警" />
  </div>
</template>

<script>
export default {
  name: 'SmellAlerts',
  props: {
    smells: { type: Array, default: () => [] },
    limit: { type: Number, default: 5 }
  },
  computed: {
    topSmells() {
      const order = { HIGH: 0, MEDIUM: 1, LOW: 2 }
      return [...this.smells]
        .sort((a, b) => (order[a.severity] ?? 9) - (order[b.severity] ?? 9))
        .slice(0, this.limit)
    }
  },
  methods: {
    severityType(s) {
      return s === 'HIGH' ? 'error' : s === 'MEDIUM' ? 'warning' : 'info'
    }
  }
}
</script>
