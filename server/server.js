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

// 代理路由
const openai = new OpenAI({
  baseURL: process.env.API_BASE,
  apiKey: process.env.API_KEY,
  dangerouslyAllowBrowser: true
});

// 健康检查端点
app.get('/', (req, res) => {
  res.status(200).send('Server is running');
});

// OpenAI 代理端点
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

// 启动服务
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});