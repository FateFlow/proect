// Файл: backend/db/pool.js
const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' }); // Указываем путь к .env относительно папки db

// Настройка подключения к базе данных PostgreSQL из переменных окружения
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Проверка подключения при старте (опционально, но полезно)
pool.connect((err, client, release) => {
  if (err) {
    console.error('Ошибка инициализации пула соединений с БД:', err.stack);
    // Можно остановить приложение, если БД критична
    // process.exit(1);
    return;
  }
  console.log('Пул соединений с БД успешно инициализирован.');
  release(); // Важно освободить клиента
});

// Обработчик ошибок для всего пула (ловит ошибки простаивающих клиентов)
pool.on('error', (err, client) => {
  console.error('Неожиданная ошибка на простаивающем клиенте БД', err);
  process.exit(-1); // Выход из приложения при серьезных ошибках БД
});


module.exports = pool; // Экспортируем готовый пул