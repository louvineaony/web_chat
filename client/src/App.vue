<template>
    <div class="container">
        <div class='output-section'>
            <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.role]">
                <img v-show="msg.role === 'user'" src="/user.png" alt="User avatar" class="avatar">
                <MarkdownRenderer class="msg markdown-container" :content="msg.content" />
                <img v-show="msg.role === 'assistant'" src="/ds.svg" alt="Assistant icon" class="avatar">
            </div>
        </div>
    </div>

    <div class="input-section">
        <select v-model="model" :disabled="isSending" @change="clear">
            <option value="chat">DeepSeek-V3</option>
            <option value="reasoner">DeepSeek-R1</option>
        </select>
        <input type="text" v-model.trim="inputText" placeholder="请输入内容" :disabled="isSending"
            @keyup.enter="handleSend" />
        <div class="action-buttons">
            <button @click="handleSend" :disabled="isSending || !inputValid">
                {{ isSending ? '发送中...' : '发送' }}
            </button>
            <button @click="handleClear" class="secondary" :disabled="isSending">清空上下文</button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import MarkdownRenderer from './components/MarkdownRenderer.vue'

// 响应式数据
const inputText = ref('');
const isSending = ref(false);
const messages = ref([]);
const msgBox = ref([
    { role: "system", content: "You are a helpful assistant." }
]);
const model = ref('chat');
const api = import.meta.env.VITE_API_URL;

// 计算属性
const inputValid = computed(() => inputText.value.trim().length > 0);

async function handleSend() {
    if (!inputValid.value || isSending.value) return;
    try {
        isSending.value = true;
        const userMessage = inputText.value.trim();

        // 更新消息列表
        messages.value.push({ content: userMessage, role: 'user' });
        msgBox.value.push({ role: "user", content: userMessage });
        inputText.value = '';

        // API 调用
        let response = null;
        if (model.value == 'reasoner') {
            response = await fetch(`${api}/reasoner`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msgBox.value)
            });
        } else {
            response = await fetch(`${api}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msgBox.value)
            });
        }
        const completion = await response.json();
        console.log(completion);

        // 处理响应
        const assistantMessage = completion.choices[0].message.content;
        const reasoning_content = completion.choices[0].message.reasoning_content;
        if (reasoning_content != null) {
            messages.value.push({ content: `<think>${reasoning_content}</think>`, role: "assistant" });
        }
        messages.value.push({ content: assistantMessage, role: "assistant" });
        msgBox.value.push({ role: "assistant", content: assistantMessage });

    } catch (error) {
        console.error('API Error:', error);
        messages.value.push({
            content: `请求失败: ${error.message}`,
            role: "error"
        });
    } finally {
        isSending.value = false;
    }
};

function clear() {
    messages.value = [];
    msgBox.value.splice(1); // 保留 system message
}
function handleClear() {
    if (confirm('确定要清空对话历史吗？')) {
        clear();
    }
};
</script>

<style scoped>
.container {
    max-width: 1200px;
    margin: 20px auto;
    padding: 0 15px;
}

.input-section {
    display: flex;
    gap: 10px;
    margin: 20px 0;
    flex-wrap: wrap;
    align-content: flex-end;
}

input {
    flex: 1;
    min-width: 250px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    max-height: 50px;
}

select {
    border-radius: 8px;
    font-size: 16px;
}

button {
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    transition: opacity 0.2s;
}

button:not(:disabled):hover {
    opacity: 0.9;
}

button[disabled] {
    cursor: not-allowed;
    opacity: 0.6;
}

button.primary {
    background-color: #007bff;
    color: white;
}

button.secondary {
    background-color: #6c757d;
    color: white;
}

.action-buttons {
    display: flex;
    gap: 10px;
}

.output-section {
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 15px;
    background: #fafafa;
    min-height: 60vh;
    max-height: 70vh;
    overflow-y: auto;
}

.message {
    display: flex;
    gap: 12px;
    padding: 12px;
    margin: 15px 0;
    border-radius: 8px;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.avatar {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    border-radius: 50%;
}

.msg {
    flex: 1;
    padding: 12px;
    border-radius: 6px;
    background: #f8f9fa;
    line-height: 1.6;
}

@media (max-width: 768px) {
    .container {
        margin: 10px auto;
    }

    input {
        font-size: 14px;
    }

    .msg {
        font-size: 14px;
        padding: 8px;
    }

    .avatar {
        width: 28px;
        height: 28px;
    }
}

.markdown-container {
    max-width: 100%;
    overflow-x: hidden;
}

.markdown-content {
    word-wrap: break-word;
    overflow-wrap: break-word;
    line-height: 1.6;
}

/* 深度选择器处理动态生成的 HTML 内容 */
:deep(.markdown-content) pre {
    white-space: pre-wrap;
    word-break: break-all;
    overflow-x: auto;
    background: #f5f5f5;
    padding: 1rem;
    border-radius: 4px;
    margin: 1rem 0;
}

:deep(.markdown-content) img {
    max-width: 100%;
    height: auto;
    margin: 1rem auto;
}

:deep(.markdown-content) table {
    width: 100% !important;
    display: block;
    overflow-x: auto;
    white-space: nowrap;
}

@media (max-width: 768px) {
    .markdown-content {
        font-size: 14px;
    }

    :deep(.markdown-content) pre {
        font-size: 12px;
    }
}
</style>