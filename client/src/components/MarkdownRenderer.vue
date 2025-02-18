<template>
    <div class="markdown-content" v-html="compiledMarkdown"></div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  import { marked } from 'marked'
  import hljs from 'highlight.js'
  import 'highlight.js/styles/github.css' // 选择你喜欢的代码高亮样式
  
  const props = defineProps({
    content: {
      type: String,
      required: true
    }
  })
  
  // 配置 marked
  marked.setOptions({
    highlight: function (code, language) {
      const validLanguage = hljs.getLanguage(language) ? language : 'plaintext'
      return hljs.highlight(code, { language: validLanguage }).value
    },
    langPrefix: 'hljs language-', // 与 highlight.css 样式配合
    breaks: true,                 // 换行符转换为 <br>
    gfm: true                     // GitHub 风格的 Markdown
  })
  
  const compiledMarkdown = ref('')
  
  watch(() => props.content, (newVal) => {
    compiledMarkdown.value = marked.parse(newVal)
  }, { immediate: true })
  </script>
  
  <style>
  /* 基础 Markdown 样式 */
  .markdown-content {
    line-height: 1.6;
  }
  
  .markdown-content h1 { font-size: 2em; }
  .markdown-content h2 { font-size: 1.5em; }
  /* 添加更多自定义样式... */
  
  /* 确保代码块样式正确 */
  .markdown-content pre {
    padding: 1em;
    border-radius: 4px;
    overflow-x: auto;
  }
  </style>