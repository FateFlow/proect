// Файл: backend/routes/user.js
const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const pool = require('../db/pool');

const router = express.Router();

// GET /api/user/profile
router.get('/profile', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const userResult = await pool.query(
      // Используем users, добавляем phone если его нет в прошлых запросах
      'SELECT id, email, name, phone, currency, created_at, updated_at FROM users WHERE id = $1', // ИЗМЕНЕНО
      [userId]
    );
    const currentUser = userResult.rows[0];
    if (!currentUser) { return res.status(404).json({ success: false, message: 'Пользователь не найден' }); }
    res.status(200).json({ success: true, user: currentUser });
  } catch (error) { console.error('Ошибка при получении профиля пользователя:', error); res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при получении профиля' }); }
});

// PATCH /api/user/profile
router.patch('/profile', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const updates = req.body;
    const allowedUpdates = ['name', 'phone', 'currency']; // Добавили phone, если нужно
    const updatesKeys = Object.keys(updates || {});
    const isValidOperation = typeof updates === 'object' && updates !== null && updatesKeys.length > 0 && updatesKeys.every(key => allowedUpdates.includes(key));
    if (!isValidOperation) { return res.status(400).json({ success: false, message: 'Недопустимые, пустые или неверные поля для обновления профиля' }); }
    // Валидация
    if (updates.hasOwnProperty('currency') && (!updates.currency || updates.currency.length !== 3)) { // Проверка на пустоту и длину
         return res.status(400).json({ success: false, message: 'Код валюты должен состоять из 3 символов' });
    }
    // Добавить валидацию для name, phone
    // if (updates.hasOwnProperty('name') && (!updates.name || updates.name.trim().length === 0)) { return res.status(400).json({ success: false, message: 'Имя не может быть пустым' }); }

    try {
        let setClause = updatesKeys.map((key, index) => `"${key}" = $${index + 2}`).join(', ');
        setClause += ', updated_at = CURRENT_TIMESTAMP';
        const updateQuery = `
          UPDATE users -- ИЗМЕНЕНО
          SET ${setClause}
          WHERE id = $1
          RETURNING id, email, name, phone, currency, created_at, updated_at;
        `;
        const queryParams = [userId, ...Object.values(updates)];
        const result = await pool.query(updateQuery, queryParams);
        if (result.rows.length === 0) { return res.status(404).json({ success: false, message: 'Пользователь для обновления не найден' }); }
        res.status(200).json({ success: true, message: 'Профиль успешно обновлен', user: result.rows[0] });
    } catch (error) { console.error('Ошибка при обновлении профиля пользователя:', error); res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при обновлении профиля' }); }
});

module.exports = router;