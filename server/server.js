import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from "openai";

dotenv.config();
const app = express();

// 安全配置
app.use(cors({
  origin: [process.env.ORIGIN, 'http://localhost:5173'] // 允许前端访问
}));

app.use(express.json());

// 路由方法
function ai(baseURL, apiKey) {
  return new OpenAI({
    baseURL: baseURL,
    apiKey: apiKey
  })
};

// deepseek官方代理路由
const openai = ai(process.env.API_BASE, process.env.API_KEY);

// 火山引擎代理路由
const openai_ark = ai(process.env.ARK_API_BASE, process.env.ARK_API_KEY);

// 火山引擎联网搜索应用代理路由
const openai_ark_net = ai(process.env.ARK_NET_API_BASE, process.env.ARK_API_KEY);

// 健康检查端点
app.get('/', (req, res) => {
  res.status(200).send('Server is running');
});

// deepseek代理端点
app.post('/chat', async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: req.body,
      model: "deepseek-chat",
      stream: false,
    });
    res.json(completion);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'OpenAI API 请求失败'
      }
    });
  }
});
app.post('/reasoner', async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: req.body,
      model: "deepseek-reasoner",
      stream: false,
    });
    res.json(completion);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'OpenAI API 请求失败'
      }
    });
  }
});

// ark代理端点
app.post('/ark', async (req, res) => {
  try {
    const completion = await openai_ark.chat.completions.create({
      messages: req.body,
      model: process.env.ARK_MODEL
    });
    res.json(completion);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'OpenAI API 请求失败'
      }
    });
  }
});
app.post('/ark_net', async (req, res) => {
  try {
    const completion = await openai_ark_net.chat.completions.create({
      messages: req.body,
      model: process.env.ARK_NET_MODEL
    });
    res.json(completion);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'OpenAI API 请求失败'
      }
    });
  }
});

// 启动服务
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});