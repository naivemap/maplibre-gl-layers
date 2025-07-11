<template>
  <div class="demo-wrapper">
    <iframe height="400" width="100%" :src="url" frameborder="0"> </iframe>
    <div class="language-html" v-if="sourceCode">
      <button title="复制代码" class="copy"></button>
      <span class="lang">html</span>
      <div v-html="sourceCode"></div>
    </div>
  </div>
</template>

<script setup>
  import { codeToHtml } from 'shiki'
  import { ref, onMounted, watch } from 'vue'

  const props = defineProps({
    url: {
      type: String,
      default: ''
    }
  })

  const sourceCode = ref('')

  const fetchSourceCode = async () => {
    if (!props.url) return
    try {
      const response = await fetch(props.url)
      const code = await response.text()
      const html = await codeToHtml(code, {
        lang: 'html',
        theme: 'github-light'
      })
      sourceCode.value = html
    } catch (error) {
      console.error('获取源码失败:', error)
    }
  }

  onMounted(() => {
    fetchSourceCode()
  })

  watch(
    () => props.url,
    () => {
      fetchSourceCode()
    }
  )
</script>

<style>
  .demo-wrapper {
    margin: 16px 0;
    border: 1px solid #eaeaea;
    border-radius: 4px;
  }

  .demo-content {
    padding: 16px;
  }

  .demo-content__source {
    margin-top: 16px;
    background-color: #f5f5f5;
    padding: 16px;
    border-radius: 4px;
    overflow-x: auto;
  }

  .demo-content__source pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .demo-content__source code {
    font-family: monospace;
    font-size: 14px;
  }
</style>
