const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Разрешаем подключение с любого сайта (для теста)
    methods: ["GET", "POST"]
  }
});

// Хранилище активных пользователей (в памяти)
let activeUsers = [];

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Пользователь зашел в приложение
  socket.on('join_server', (user) => {
    // Добавляем user в список, если его там нет или обновляем socket.id
    // Простая логика: удаляем старую запись с таким ID и добавляем новую
    activeUsers = activeUsers.filter(u => u.id !== user.id);
    
    const newUserEntry = { ...user, socketId: socket.id, status: 'online' };
    activeUsers.push(newUserEntry);

    // Отправляем всем обновленный список
    io.emit('update_users', activeUsers);
  });

  // Обработка отправки сообщения
  socket.on('send_message', (data) => {
    // data должно содержать: { id, content, type, author, channelId, timestamp }
    // Рассылаем сообщение ВСЕМ, включая отправителя
    io.emit('receive_message', data);
  });

  // Отключение
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Убираем пользователя из списка онлайн (или помечаем offline)
    // Вариант: удаляем совсем
    activeUsers = activeUsers.filter(u => u.socketId !== socket.id);
    io.emit('update_users', activeUsers);
  });
});

// ВАЖНО: Render выдает порт через process.env.PORT
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});