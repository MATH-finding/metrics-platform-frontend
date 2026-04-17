<template>
  <el-card shadow="hover">
    <template #header>
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-weight: 500;">
          <el-icon style="vertical-align: middle; margin-right: 6px;"><Upload /></el-icon>
          文件上传
        </span>
        <el-tag size="small" type="info">支持 .java / .zip / .jar</el-tag>
      </div>
    </template>

    <el-upload
        ref="upload"
        :action="uploadUrl"
        :before-upload="beforeUpload"
        :on-success="handleSuccess"
        :on-error="handleError"
        :show-file-list="true"
        :limit="1"
        :accept="'.java,.zip,.jar'"
        drag
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          支持单个.java文件、.zip压缩包或.jar包（最大50MB）
        </div>
      </template>
    </el-upload>

    <div v-if="uploading" style="margin-top: 16px; text-align: center;">
      <el-progress :percentage="progress" />
      <p style="margin-top: 8px; color: #909399; font-size: 13px;">
        正在解析代码...
      </p>
    </div>
  </el-card>
</template>

<script>
import { Upload, UploadFilled } from '@element-plus/icons-vue'

export default {
  name: 'UploadPanel',
  components: { Upload, UploadFilled },
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      uploadUrl: 'http://localhost:8080/api/parse',
      uploading: false,
      progress: 0
    }
  },
  methods: {
    beforeUpload(file) {
      const isValid = file.name.endsWith('.java') ||
          file.name.endsWith('.zip') ||
          file.name.endsWith('.jar')

      if (!isValid) {
        this.$message.error('只支持.java、.zip、.jar格式文件！')
        return false
      }

      const isLt50M = file.size / 1024 / 1024 < 50
      if (!isLt50M) {
        this.$message.error('文件大小不能超过50MB！')
        return false
      }

      this.uploading = true
      this.progress = 0
      this.simulateProgress()

      return true
    },

    handleSuccess(response) {
      this.uploading = false
      this.progress = 100

      if (response.success) {
        this.$emit('upload-success', response)
      } else {
        this.$emit('upload-error', response.message || '解析失败')
      }
    },

    handleError(error) {
      this.uploading = false
      this.progress = 0
      this.$emit('upload-error', '上传失败，请检查网络连接')
    },

    simulateProgress() {
      const timer = setInterval(() => {
        if (this.progress < 90) {
          this.progress += 10
        } else {
          clearInterval(timer)
        }
      }, 300)
    }
  }
}
</script>

<style scoped>
.el-upload__tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}
</style>