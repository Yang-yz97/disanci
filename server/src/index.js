const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const productsRouter = require('./routes/products');
const suppliersRouter = require('./routes/suppliers');
const inboundRouter = require('./routes/inbound');

const app = express();

// 详细的日志记录中间件
const logRequest = (req, res, next) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  // 请求开始日志
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    type: 'REQUEST',
    id: requestId,
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    query: req.query,
    body: req.body,
    ip: req.ip
  }));

  // 响应完成时的日志
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      type: 'RESPONSE',
      id: requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: duration,
      ip: req.ip
    }));
  });

  // 错误发生时的日志
  res.on('error', (error) => {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      type: 'ERROR',
      id: requestId,
      method: req.method,
      url: req.originalUrl,
      error: error.message,
      stack: error.stack,
      ip: req.ip
    }));
  });

  next();
};

// CORS 配置
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// 请求体解析中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 应用日志中间件
app.use(logRequest);

// 健康检查路由
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version
    }
  });
});

// API 路由配置
app.use('/api/products', productsRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/inbound', inboundRouter);

// 404 处理
app.use((req, res) => {
  const error = {
    timestamp: new Date().toISOString(),
    type: '404_ERROR',
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  };
  console.log('404 Not Found:', JSON.stringify(error));
  res.status(404).json({
    code: 404,
    message: '请求的资源不存在',
    path: req.originalUrl
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  const error = {
    timestamp: new Date().toISOString(),
    type: 'SERVER_ERROR',
    method: req.method,
    url: req.originalUrl,
    error: err.message,
    stack: err.stack,
    ip: req.ip
  };
  console.error('服务器错误:', JSON.stringify(error));
  res.status(500).json({
    code: 500,
    message: '服务器内部错误: ' + (err.message || '未知错误'),
    path: req.originalUrl
  });
});

// MongoDB 连接
mongoose.connect('mongodb://127.0.0.1:27017/warehouse', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    type: 'DB_CONNECTION',
    status: 'success',
    message: 'MongoDB connected'
  }));
})
.catch((err) => {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    type: 'DB_CONNECTION_ERROR',
    error: err.message,
    stack: err.stack
  }));
  process.exit(1);
});

// 优雅关闭
process.on('SIGTERM', () => {
  const shutdownMsg = {
    timestamp: new Date().toISOString(),
    type: 'SERVER_SHUTDOWN',
    message: '收到 SIGTERM 信号，准备关闭服务器'
  };
  console.log(JSON.stringify(shutdownMsg));
  mongoose.connection.close();
  process.exit(0);
});

// 启动服务器
const PORT = 8080;
app.listen(PORT, '0.0.0.0', () => {
  const startupMsg = {
    timestamp: new Date().toISOString(),
    type: 'SERVER_STARTUP',
    port: PORT,
    env: process.env.NODE_ENV || 'development',
    node_version: process.version,
    endpoints: {
      health: `http://localhost:${PORT}/health`,
      api: `http://localhost:${PORT}/api/products`
    }
  };
  console.log(JSON.stringify(startupMsg));
}); 