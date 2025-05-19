// Файл: backend/routes/goals.js
const express = require('express');
const authenticateToken = require('../middleware/authenticateToken'); // Убедись, что путь к middleware верный
const pool = require('../db/pool'); // Убедись, что путь к db pool верный

const router = express.Router();

// POST /api/goals - Создание новой цели
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId; // Убедись, что это правильное поле для ID пользователя из токена
  const { name, target_amount, deadline, icon } = req.body;

  if (!name || !target_amount) {
    return res.status(400).json({ success: false, message: 'Поля name и target_amount обязательны' });
  }
  if (isNaN(parseFloat(target_amount)) || parseFloat(target_amount) <= 0) {
    return res.status(400).json({ success: false, message: 'Поле target_amount должно быть положительным числом' });
  }
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (deadline && !dateRegex.test(deadline)) {
    return res.status(400).json({ success: false, message: 'Поле deadline должно быть в формате YYYY-MM-DD' });
  }

  try {
    const insertQuery = `
      INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, icon)
      VALUES ($1, $2, $3, 0, $4, $5)  -- current_amount по умолчанию 0 при создании
      RETURNING id, user_id, name, target_amount, current_amount, deadline, icon, created_at, updated_at;
    `;
    const result = await pool.query(insertQuery, [userId, name, parseFloat(target_amount), deadline || null, icon || null]);
    res.status(201).json({ success: true, message: 'Финансовая цель успешно добавлена', goal: result.rows[0] });
  } catch (error) {
    console.error('Ошибка при добавлении цели:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при добавлении цели' });
  }
});

// GET /api/goals - Получение списка целей пользователя
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { page: queryPage, limit: queryLimit, sortBy, sortOrder, achieved, deadlineStart, deadlineEnd } = req.query;

  const page = parseInt(queryPage || '1', 10);
  const limit = parseInt(queryLimit || '10', 10);
  const offset = (page - 1) * limit;

  const allowedSortBy = ['name', 'target_amount', 'current_amount', 'deadline', 'created_at', 'updated_at'];
  const allowedSortOrder = ['ASC', 'DESC'];
  const validSortBy = allowedSortBy.includes(sortBy) ? `"${sortBy}"` : '"created_at"'; // Обертываем имена столбцов в кавычки, если они содержат зарезервированные слова или требуют этого в PostgreSQL
  const validSortOrder = allowedSortOrder.includes(String(sortOrder).toUpperCase()) ? String(sortOrder).toUpperCase() : 'DESC';

  let filterConditions = [];
  let queryParams = [userId];
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (achieved === 'true' || achieved === 'false') {
    const condition = achieved === 'true' ? 'current_amount >= target_amount' : 'current_amount < target_amount';
    filterConditions.push(condition);
  }
  if (deadlineStart && dateRegex.test(deadlineStart)) {
    queryParams.push(deadlineStart);
    filterConditions.push(`deadline::DATE >= $${queryParams.length}`);
  }
  if (deadlineEnd && dateRegex.test(deadlineEnd)) {
    queryParams.push(deadlineEnd);
    filterConditions.push(`deadline::DATE <= $${queryParams.length}`);
  }
  const whereClause = filterConditions.length > 0 ? `AND ${filterConditions.join(' AND ')}` : '';

  try {
    const selectQuery = `
      SELECT id, user_id, name, target_amount, current_amount, deadline, icon, created_at, updated_at
      FROM goals
      WHERE user_id = $1 ${whereClause}
      ORDER BY ${validSortBy} ${validSortOrder}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2};
    `;
    const countQuery = `SELECT COUNT(*) FROM goals WHERE user_id = $1 ${whereClause};`;

    const countQueryParams = [...queryParams]; // Копируем для count-запроса до добавления limit/offset
    const selectQueryParams = [...queryParams, limit, offset];

    const [goalsResult, countResult] = await Promise.all([
      pool.query(selectQuery, selectQueryParams),
      pool.query(countQuery, countQueryParams)
    ]);

    const totalGoals = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalGoals / limit);

    // Формируем объект пагинации (пример)
    const pagination = {
        currentPage: page,
        totalPages: totalPages,
        totalGoals: totalGoals,
        limit: limit
    };
    // Формируем объект примененных фильтров (пример)
    const filtersApplied = {
        achieved: achieved,
        deadlineStart: deadlineStart,
        deadlineEnd: deadlineEnd,
        sortBy: sortBy || 'created_at',
        sortOrder: sortOrder || 'DESC'
    };


    res.status(200).json({
      success: true,
      pagination: pagination, // Добавляем информацию о пагинации
      filtersApplied: filtersApplied, // Добавляем информацию о фильтрах
      goals: goalsResult.rows
    });
  } catch (error) {
    console.error('Ошибка при получении целей:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при получении целей' });
  }
});

// PATCH /api/goals/:id - Обновление существующей цели
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

  if (updates.hasOwnProperty('target_amount') && (isNaN(parseFloat(updates.target_amount)) || parseFloat(updates.target_amount) <= 0)) {
    return res.status(400).json({ success: false, message: 'target_amount должен быть положительным числом' });
  }
  if (updates.hasOwnProperty('current_amount') && (isNaN(parseFloat(updates.current_amount)) || parseFloat(updates.current_amount) < 0)) {
    return res.status(400).json({ success: false, message: 'current_amount должен быть неотрицательным числом' });
  }
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (updates.hasOwnProperty('deadline') && updates.deadline !== null && !dateRegex.test(updates.deadline)) {
    return res.status(400).json({ success: false, message: 'deadline должен быть в формате YYYY-MM-DD или null' });
  }

  try {
    // Формируем SET часть запроса динамически
    let setParts = [];
    let queryValues = [goalId]; // Первое значение для WHERE id = $1
    let paramIndex = 2; // Начинаем нумерацию параметров для SET части с $2

    for (const key of updatesKeys) {
        if (allowedUpdates.includes(key)) {
            setParts.push(`"${key}" = $${paramIndex}`);
            queryValues.push(updates[key]);
            paramIndex++;
        }
    }
    setParts.push(`updated_at = CURRENT_TIMESTAMP`); // Всегда обновляем updated_at

    if (setParts.length === 1) { // Только updated_at, значит, других полей нет
        return res.status(400).json({ success: false, message: 'Нет полей для обновления.' });
    }
    
    queryValues.push(userId); // Последнее значение для WHERE user_id = $X

    const updateQuery = `
      UPDATE goals 
      SET ${setParts.join(', ')} 
      WHERE id = $1 AND user_id = $${paramIndex}
      RETURNING *;
    `;
    
    const result = await pool.query(updateQuery, queryValues);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Цель не найдена или не принадлежит вам' });
    }
    res.status(200).json({ success: true, message: 'Цель успешно обновлена', goal: result.rows[0] });
  } catch (error) {
    console.error('Ошибка при обновлении цели:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при обновлении цели' });
  }
});

// DELETE /api/goals/:id - Удаление цели
router.delete('/:id', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const goalId = req.params.id;

  try {
    const deleteQuery = `DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING id;`;
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


// --- НОВЫЙ МАРШРУТ: PATCH /api/goals/:goalId/add_funds ---
router.patch('/:goalId/add_funds', authenticateToken, async (req, res) => {
    const { goalId } = req.params;
    let { amount } = req.body;
    const userId = req.user.userId;

    console.log(`Backend - /goals/${goalId}/add_funds: Received raw amount from req.body:`, req.body.amount);

    amount = parseFloat(amount);
    console.log(`Backend - /goals/${goalId}/add_funds: Parsed amount:`, amount);
    
    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid amount. Amount must be a positive number.' });
    }
    if (!goalId || isNaN(parseInt(goalId))) {
        return res.status(400).json({ success: false, message: 'Invalid goal ID.' });
    }

    try {
        const getGoalQuery = 'SELECT current_amount, target_amount FROM goals WHERE id = $1 AND user_id = $2';
        const goalResult = await pool.query(getGoalQuery, [goalId, userId]);

        if (goalResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Goal not found or access denied.' });
        }

        const currentAmountInDb = parseFloat(goalResult.rows[0].current_amount);
        // const targetAmountInDb = parseFloat(goalResult.rows[0].target_amount); // Можно использовать для проверки

        let newCurrentAmount = currentAmountInDb + amount;
        
        // Опционально: не давать current_amount превышать target_amount
        // if (newCurrentAmount > targetAmountInDb) {
        //     newCurrentAmount = targetAmountInDb; 
        // }

        const updateQuery = `
            UPDATE goals 
            SET current_amount = $1, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2 AND user_id = $3
            RETURNING *;
        `;

        const updatedGoalResult = await pool.query(updateQuery, [newCurrentAmount, goalId, userId]);

        if (updatedGoalResult.rows.length === 0) {
            console.error(`Failed to update goal ${goalId} for user ${userId} after verification.`);
            return res.status(500).json({ success: false, message: 'Failed to update goal amount.' });
        }

        console.log(`Funds added to goal ${goalId} by user ${userId}. New current_amount: ${newCurrentAmount}`);
        res.json({ success: true, message: 'Funds added successfully to goal.', goal: updatedGoalResult.rows[0] });

    } catch (err) {
        console.error(`Error adding funds to goal ${goalId} for user ${userId}:`, err);
        res.status(500).json({ success: false, message: 'Server error while adding funds to goal.' });
    }
});
// --- КОНЕЦ НОВОГО МАРШРУТА ---

module.exports = router;