// Файл: backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const router = express.Router();
const saltRounds = 10;

// --- МАРШРУТ РЕГИСТРАЦИИ: POST /api/auth/register ---
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Имя, email и пароль обязательны для регистрации.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Пароль должен содержать не менее 6 символов.' });
  }

  try {
    // 2. Проверка email - ИЗМЕНЕНО ТУТ: "Users" -> users
    const existingUserResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUserResult.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Пользователь с таким email уже существует.' });
    }

    // 3. Хеширование пароля
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Добавление пользователя - ИЗМЕНЕНО ТУТ: "Users" -> users
    // Убедись, что имена столбцов (name, email, password_hash) верны!
    const newUserResult = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, passwordHash]
    );
    const newUser = newUserResult.rows[0];
    console.log('Пользователь успешно зарегистрирован:', newUser);

    // 5. Отправка успешного ответа
    res.status(201).json({
      success: true,
      message: 'Регистрация прошла успешно! Теперь вы можете войти.',
      user: { id: newUser.id, name: newUser.name, email: newUser.email }
    });

  } catch (error) {
    console.error('Ошибка при регистрации пользователя:', error);
    if (error.code === '23505') {
       return res.status(409).json({ success: false, message: 'Пользователь с таким email уже существует (ошибка БД).' });
    }
    // Добавим вывод самой ошибки для диагностики
    console.error('Полная ошибка регистрации:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при регистрации.' });
  }
});

// --- МАРШРУТ ВХОДА: POST /api/auth/login ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email и пароль обязательны' });
  }

  try {
    // 1. Найти пользователя - ИЗМЕНЕНО ТУТ: "Users" -> users
    // Убедись, что имена столбцов (id, email, password_hash, name, currency) верны!
    const userResult = await pool.query('SELECT id, email, password_hash, name, currency FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({ success: false, message: 'Неверный email или пароль' });
    }

    // 3. Сравнить пароль
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Неверный email или пароль' });
    }

    // 5. Создаем JWT
    const payload = { userId: user.id, email: user.email };
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '1h';

    if (!secret) {
        console.error("Ошибка: Секретный ключ JWT не установлен в .env!");
        return res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера (JWT Secret Missing)' });
    }
    const token = jwt.sign(payload, secret, { expiresIn: expiresIn });

    // 6. Отправляем токен и данные пользователя
    res.status(200).json({
      success: true,
      message: 'Вход выполнен успешно',
      token: token,
      user: { id: user.id, email: user.email, name: user.name, currency: user.currency }
    });

  } catch (error) {
    console.error('Ошибка при входе пользователя:', error);
     // Добавим вывод самой ошибки для диагностики
    console.error('Полная ошибка входа:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при входе' });
  }
});

module.exports = router;