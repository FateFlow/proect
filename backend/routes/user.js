// Файл: backend/routes/user.js
const express = require('express');
const authenticateToken = require('../middleware/authenticateToken'); // Импортируем наше middleware
const pool = require('../db/pool');
// const bcrypt = require('bcrypt'); // Пока не используем

const router = express.Router();

// --- Маршрут для получения профиля пользователя ---
// GET /api/user/profile
// Защищен authenticateToken
router.get('/profile', authenticateToken, async (req, res) => {
  // Благодаря authenticateToken, у нас есть req.user с данными из токена (userId, email)
  const userId = req.user.userId;

  try {
    // Получим актуальные данные пользователя из БД (на случай, если они изменились)
    // Исключаем password_hash из выборки
    const userResult = await pool.query(
      'SELECT id, email, name, phone, currency, created_at, updated_at FROM Users WHERE id = $1',
      [userId]
    );

    const currentUser = userResult.rows[0];

    if (!currentUser) {
      // Этого не должно произойти, если токен валиден, но на всякий случай
      return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }

    res.status(200).json({ success: true, user: currentUser });

  } catch (error) {
    console.error('Ошибка при получении профиля пользователя:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при получении профиля' });
  }
});


// --- Маршрут для обновления профиля пользователя ---
// PATCH /api/user/profile
router.patch('/profile', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const updates = req.body;

    // Поля, которые разрешено обновлять (пока без email/password)
    const allowedUpdates = ['name', 'phone', 'currency'];
    const updatesKeys = Object.keys(updates || {});

    const isValidOperation = typeof updates === 'object' && updates !== null && updatesKeys.length > 0 && updatesKeys.every(key => allowedUpdates.includes(key));

    if (!isValidOperation) {
        return res.status(400).json({ success: false, message: 'Недопустимые, пустые или неверные поля для обновления профиля' });
    }

    // --- Дополнительная валидация (примеры) ---
    if (updates.hasOwnProperty('currency') && updates.currency.length !== 3) {
         // Простая проверка на 3 символа для кода валюты
         return res.status(400).json({ success: false, message: 'Код валюты должен состоять из 3 символов' });
    }
    // Добавить валидацию для phone, name, если нужно
    // --- Конец Валидации ---

    try {
        // Динамический SQL-запрос для обновления
        let setClause = updatesKeys
            .map((key, index) => `"${key}" = $${index + 2}`)
            .join(', ');
        setClause += ', updated_at = CURRENT_TIMESTAMP'; // Обновляем updated_at

        const updateQuery = `
          UPDATE Users
          SET ${setClause}
          WHERE id = $1 -- Обновляем только по ID пользователя
          RETURNING id, email, name, phone, currency, created_at, updated_at; -- Возвращаем обновленные данные (без хеша пароля!)
        `;

        // В values передаем сначала userId, потом значения из updates
        const queryParams = [userId, ...Object.values(updates)];

        const result = await pool.query(updateQuery, queryParams);

        // Проверка, что пользователь был найден (хотя это гарантируется токеном, но все же)
        if (result.rows.length === 0) {
             // Эта ситуация маловероятна, если токен валиден
             return res.status(404).json({ success: false, message: 'Пользователь для обновления не найден' });
        }

        res.status(200).json({
            success: true,
            message: 'Профиль успешно обновлен',
            user: result.rows[0]
        });

    } catch (error) {
        // Обработка возможных ошибок БД (например, нарушение UNIQUE для email, если бы мы его меняли)
        console.error('Ошибка при обновлении профиля пользователя:', error);
        res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при обновлении профиля' });
    }
});


module.exports = router; // Экспорт в конце файла