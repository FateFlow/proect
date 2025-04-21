// Файл: backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/pool'); // Импортируем настроенный пул
const userRoutes = require('./routes/user');
const transactionRoutes = require('./routes/transactions');
const billRoutes = require('./routes/bills');
const goalRoutes = require('./routes/goals');
const dashboardRoutes = require('./routes/dashboard');
const reportRoutes = require('./routes/reports');

// --- Импортируем наши маршруты ---
const authRoutes = require('./routes/auth');
// const transactionRoutes = require('./routes/transactions'); // Добавим позже
// const billRoutes = require('./routes/bills'); // Добавим позже
// const goalRoutes = require('./routes/goals'); // Добавим позже

const app = express();
const PORT = process.env.PORT || 5000;

// Настройка CORS
const corsOptions = {
  origin: 'http://localhost:3000', // Адрес твоего React-приложения
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Middleware для парсинга JSON
app.use(express.json());

// Простой тестовый маршрут (можно оставить или удалить)
app.get('/', (req, res) => {
  res.send('Привет от Expense Tracker Backend!');
});

// --- Подключаем маршруты к приложению ---
// Все запросы на /api/auth будут обрабатываться в authRoutes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/goals', goalRoutes); 
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
// app.use('/api/transactions', transactionRoutes); // Добавим позже
// app.use('/api/bills', billRoutes); // Добавим позже
// app.use('/api/goals', goalRoutes); // Добавим позже


// Обработчик ошибок (простой пример, можно улучшить)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Что-то пошло не так!');
});


// Запускаем сервер
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  // Дополнительно проверим, что пул доступен (не обязательно, но можно)
  if (pool) {
    console.log('Пул соединений с БД доступен.');
  } else {
    console.error('Пул соединений с БД НЕ доступен!');
  }
});