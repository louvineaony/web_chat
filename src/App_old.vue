<template>
    <div class="container">
        <div class='output-section'>
            <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.role]">
                <img src="\user.png" alt="Image" :hidden="msg.role == 'user' ? false : true">
                <p class="msg">{{ msg.content }}</p>
                <img src="\ds.svg" alt="Icon" :hidden="msg.role == 'user' ? true : false">
            </div>
        </div>
    </div>

    <div class="input-section">
        <input type="text" v-model="inputText" placeholder="请输入内容" @keyup.enter="main" />
        <button @click="main" :disabled="isSending">
            {{ isSending ? '发送中...' : '发送' }}
        </button>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import OpenAI from "openai";

// 响应式数据
const inputText = ref('');
const messages = ref([]);
const isSending = ref(false);
var completion = null;
var msgBox = [{ role: "system", content: "You are a helpful assistant." }];

// API 地址
const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: 'sk-515ac1901edf46bf8103d865cc13f0be',
    dangerouslyAllowBrowser: true
});

async function main() {
    if (!inputText.value.trim() || isSending.value) return;
    isSending.value = true;

    // 用户的发送信息推送到结尾
    messages.value.push({
        content: inputText.value,
        role: 'user',
    });

    // 用户的发送信息推进消息盒
    msgBox.push({ "role": "user", "content": inputText.value });

    // 发送消息
    completion = await openai.chat.completions.create({
        messages: msgBox,
        model: "deepseek-chat",
        stream: false,
    });

    // 将新消息添加到数组结尾
    // messages.value.push({
    //     content: completion.choices[0].message.reasoning_content,
    //     timestamp: new Date().toISOString(),
    // });
    messages.value.push({
        content: completion.choices[0].message.content,
        role: "assistant",
    });

    // 把回答推进消息盒
    msgBox.push({ "role": "assistant", "content": completion.choices[0].message.content });

    // 清空输入框
    inputText.value = '';
    isSending.value = false;
}
</script>

<style scoped>
.container {
    max-width: 1200px;
    margin: 20px auto;
    padding: 20px;
}

.input-section {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    width: 1200px;
}

input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

button {
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
}

.output-section {
    width: 1000px;
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 10px;
}

.message {
    padding: 8px;
    margin: 20px 0;
    border-radius: 4px;
    display: flex;
}

.message:first-child {
    margin-top: 0;
}

.msg {
    padding: 8px;
    background-color: #f8f9fa;
}

img {
    width: 25px;
    height: 25px;
}

.user {
    margin-right: 200px;
}

.assistant {
    margin-left: 200px;
}
</style>