// Файл: backend/routes/goals.js
const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const pool = require('../db/pool');

const router = express.Router();

// --- Маршрут для добавления новой финансовой цели ---
// POST /api/goals
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { name, target_amount, deadline, icon } = req.body;

  // Валидация
  if (!name || !target_amount) {
    return res.status(400).json({ success: false, message: 'Поля name и target_amount обязательны' });
  }
  if (isNaN(parseFloat(target_amount)) || parseFloat(target_amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Поле target_amount должно быть положительным числом' });
  }
  // Валидация deadline, если передан
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (deadline && !dateRegex.test(deadline)) {
       return res.status(400).json({ success: false, message: 'Поле deadline должно быть в формате YYYY-MM-DD' });
  }


  try {
    const insertQuery = `
      INSERT INTO Goals (user_id, name, target_amount, deadline, icon)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, user_id, name, target_amount, current_amount, deadline, icon, created_at, updated_at;
    `;
    const result = await pool.query(insertQuery, [userId, name, parseFloat(target_amount), deadline || null, icon || null]);
    res.status(201).json({
      success: true,
      message: 'Финансовая цель успешно добавлена',
      goal: result.rows[0]
    });
  } catch (error) {
    console.error('Ошибка при добавлении цели:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при добавлении цели' });
  }
});


// --- Маршрут для получения списка целей пользователя (с пагинацией и фильтрами) ---
// GET /api/goals?page=1&limit=10&achieved=false&deadlineStart=YYYY-MM-DD&deadlineEnd=YYYY-MM-DD&sortBy=created_at&sortOrder=DESC
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { page: queryPage, limit: queryLimit, sortBy, sortOrder, achieved, deadlineStart, deadlineEnd } = req.query;


  // Пагинация
  const page = parseInt(queryPage || '1', 10);
  const limit = parseInt(queryLimit || '10', 10);
   if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
    return res.status(400).json({ success: false, message: 'Параметры page и limit должны быть положительными числами' });
  }
  const offset = (page - 1) * limit;

  // Сортировка
  const allowedSortBy = ['name', 'target_amount', 'current_amount', 'deadline', 'created_at', 'updated_at'];
  const allowedSortOrder = ['ASC', 'DESC'];
  const validSortBy = allowedSortBy.includes(sortBy) ? sortBy : 'created_at';
  const validSortOrder = allowedSortOrder.includes(String(sortOrder).toUpperCase()) ? String(sortOrder).toUpperCase() : 'DESC';

  // --- Фильтрация ---
  let filterConditions = [];
  let queryParams = [userId]; // $1 = userId
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  // Фильтр по статусу достижения (achieved)
  if (achieved === 'true' || achieved === 'false') {
      // Сравниваем current_amount и target_amount прямо в SQL
      const condition = achieved === 'true' ? 'current_amount >= target_amount' : 'current_amount < target_amount';
      filterConditions.push(condition); // Не используем $ параметры для этого сравнения
  }
  // Фильтр по дате начала крайнего срока
  if (deadlineStart && dateRegex.test(deadlineStart)) {
      queryParams.push(deadlineStart);
      filterConditions.push(`deadline >= $${queryParams.length}`);
  }
   // Фильтр по дате конца крайнего срока
  if (deadlineEnd && dateRegex.test(deadlineEnd)) {
      queryParams.push(deadlineEnd);
      filterConditions.push(`deadline <= $${queryParams.length}`);
  }

  const whereClause = filterConditions.length > 0 ? `AND ${filterConditions.join(' AND ')}` : '';
  // --- Конец Фильтрации ---


  try {
    // --- Запрос для получения целей ТЕКУЩЕЙ страницы ---
    const selectQuery = `
      SELECT id, user_id, name, target_amount, current_amount, deadline, icon, created_at, updated_at
      FROM Goals
      WHERE user_id = $1 ${whereClause} -- Добавляем фильтры
      ORDER BY ${validSortBy} ${validSortOrder}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2};
    `;

    // --- Запрос для получения ОБЩЕГО количества целей (с учетом фильтров!) ---
    const countQuery = `
      SELECT COUNT(*) FROM Goals WHERE user_id = $1 ${whereClause};
    `;

    // Копируем параметры фильтрации для countQuery (кроме сравнения current_amount и target_amount)
    const countQueryParams = [...queryParams];
    // Добавляем параметры limit и offset для selectQuery
    const selectQueryParams = [...queryParams, limit, offset];


     // --- Выполняем оба запроса ---
    const [goalsResult, countResult] = await Promise.all([
        pool.query(selectQuery, selectQueryParams),
        pool.query(countQuery, countQueryParams)
    ]);

    const totalGoals = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalGoals / limit);

    // --- Отправляем ответ ---
    res.status(200).json({
      success: true,
       pagination: {
        currentPage: page,
        limit: limit,
        totalPages: totalPages,
        totalCount: totalGoals
      },
      filtersApplied: { // Показываем, какие фильтры применены
            achieved: achieved === 'true' ? true : (achieved === 'false' ? false : null),
            deadlineStart: deadlineStart && dateRegex.test(deadlineStart) ? deadlineStart : null,
            deadlineEnd: deadlineEnd && dateRegex.test(deadlineEnd) ? deadlineEnd : null
      },
      goals: goalsResult.rows
    });

  } catch (error) {
    console.error('Ошибка при получении целей (с фильтрами):', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при получении целей' });
  }
});


// --- Маршрут для обновления цели ---
// PATCH /api/goals/:id
router.patch('/:id', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const goalId = req.params.id;
  const updates = req.body;

  const allowedUpdates = ['name', 'target_amount', 'current_amount', 'deadline', 'icon'];
  const updatesKeys = Object.keys(updates || {});

  const isValidOperation = typeof updates === 'object' && updates !== null && updatesKeys.length > 0 && updatesKeys.every(key => allowedUpdates.includes(key));

  if (!isValidOperation) {
    return res.status(400).json({ success: false, message: 'Недопустимые, пустые или неверные поля для обновления' });
  }

  // Валидация
  if (updates.hasOwnProperty('target_amount') && (isNaN(parseFloat(updates.target_amount)) || parseFloat(updates.target_amount) <= 0)) {
     return res.status(400).json({ success: false, message: 'Поле target_amount должно быть положительным числом' });
  }
   if (updates.hasOwnProperty('current_amount') && (isNaN(parseFloat(updates.current_amount)) || parseFloat(updates.current_amount) < 0)) {
     return res.status(400).json({ success: false, message: 'Поле current_amount не может быть отрицательным' });
  }
   // Валидация deadline при обновлении
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
   if (updates.hasOwnProperty('deadline') && updates.deadline !== null && !dateRegex.test(updates.deadline)) {
        return res.status(400).json({ success: false, message: 'Поле deadline должно быть в формате YYYY-MM-DD или null' });
   }


  try {
    let setClause = updatesKeys
      .map((key, index) => `"${key}" = $${index + 2}`)
      .join(', ');
    setClause += ', updated_at = CURRENT_TIMESTAMP';

    const updateQuery = `
      UPDATE Goals
      SET ${setClause}
      WHERE id = $1 AND user_id = $${updatesKeys.length + 2}
      RETURNING *;
    `;
    const queryParams = [goalId, ...Object.values(updates), userId];
    const result = await pool.query(updateQuery, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Цель не найдена или не принадлежит вам' });
    }

    res.status(200).json({
      success: true,
      message: 'Цель успешно обновлена',
      goal: result.rows[0]
    });
  } catch (error) {
    console.error('Ошибка при обновлении цели:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при обновлении цели' });
  }
});


// --- Маршрут для удаления цели ---
// DELETE /api/goals/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const goalId = req.params.id;

  try {
    const deleteQuery = `
      DELETE FROM Goals
      WHERE id = $1 AND user_id = $2
      RETURNING id;
    `;
    const result = await pool.query(deleteQuery, [goalId, userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Цель не найдена или не принадлежит вам' });
    }

    res.status(200).json({ success: true, message: 'Цель успешно удалена', deletedGoalId: goalId });
  } catch (error) {
    console.error('Ошибка при удалении цели:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при удалении цели' });
  }
});


module.exports = router; // Экспорт в конце файла