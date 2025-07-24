const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let users = {}; // 存储用户信息，key为socket.id，value为用户名

// 提供静态文件服务
app.use(express.static('public'));

// 处理Socket连接
io.on('connection', (socket) => {
  console.log('新用户连接');
  let username = null;

  // 用户注册
  socket.on('user register', (user) => {
    username = user;
    users[socket.id] = username;
    console.log(`用户 ${username} 注册成功`);
    socket.emit('register success');
  });

  // 接收客户端发送的消息并广播给所有用户
  socket.on('chat message', (message) => {
    if (username) {
      io.emit('chat message', {
        username: username,
        message: message
      });
    }
  });

  // 用户断开连接时的处理
  socket.on('disconnect', () => {
    if (username) {
      delete users[socket.id];
      console.log(`用户 ${username} 断开连接`);
    } else {
      console.log('未注册用户断开连接');
    }
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});