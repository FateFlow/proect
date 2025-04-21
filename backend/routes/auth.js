// Файл: backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Импортируем jsonwebtoken
const pool = require('../db/pool');

const router = express.Router();
const saltRounds = 10;

// Маршрут POST /api/auth/register
// (Код регистрации остается здесь)
router.post('/register', async (req, res) => {
  // ... (код регистрации без изменений) ...
});


// --- НОВЫЙ МАРШРУТ: POST /api/auth/login ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Простая валидация
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email и пароль обязательны' });
  }

  try {
    // 1. Найти пользователя по email
    const userResult = await pool.query('SELECT id, email, password_hash, name, currency FROM Users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    // 2. Если пользователь не найден
    if (!user) {
      return res.status(401).json({ success: false, message: 'Неверный email или пароль' }); // 401 Unauthorized
    }

    // 3. Сравнить предоставленный пароль с хешем в базе данных
    const isMatch = await bcrypt.compare(password, user.password_hash);

    // 4. Если пароли не совпадают
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Неверный email или пароль' }); // 401 Unauthorized
    }

    // 5. Пароли совпали -> Создаем JWT
    const payload = {
      userId: user.id,
      email: user.email
      // Можно добавить другие данные в payload, но не слишком много и не секретные
    };

    // Получаем секрет и время жизни из .env
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '1h'; // По умолчанию 1 час

    if (!secret) {
        console.error("Ошибка: Секретный ключ JWT не установлен в .env!");
        return res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера (JWT Secret Missing)' });
    }

    // Подписываем токен
    const token = jwt.sign(payload, secret, { expiresIn: expiresIn });

    // 6. Отправляем токен и данные пользователя (без хеша пароля) клиенту
    res.status(200).json({
      success: true,
      message: 'Вход выполнен успешно',
      token: token,
      user: { // Отправляем основную информацию о пользователе
        id: user.id,
        email: user.email,
        name: user.name,
        currency: user.currency
      }
    });

  } catch (error) {
    console.error('Ошибка при входе пользователя:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при входе' });
  }
});
// --- КОНЕЦ НОВОГО МАРШРУТА ---

module.exports = router;