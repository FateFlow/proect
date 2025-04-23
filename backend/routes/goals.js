// Файл: backend/routes/goals.js
const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const pool = require('../db/pool');

const router = express.Router();

// POST /api/goals
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { name, target_amount, deadline, icon } = req.body;
  // Validation...
  if (!name || !target_amount) { return res.status(400).json({ success: false, message: 'Поля name и target_amount обязательны' }); }
  if (isNaN(parseFloat(target_amount)) || parseFloat(target_amount) <= 0) { return res.status(400).json({ success: false, message: 'Поле target_amount должно быть положительным числом' }); }
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/; if (deadline && !dateRegex.test(deadline)) { return res.status(400).json({ success: false, message: 'Поле deadline должно быть в формате YYYY-MM-DD' }); }
  // End Validation
  try {
    const insertQuery = `
      INSERT INTO goals (user_id, name, target_amount, deadline, icon) -- ИЗМЕНЕНО
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, user_id, name, target_amount, current_amount, deadline, icon, created_at, updated_at;
    `;
    const result = await pool.query(insertQuery, [userId, name, parseFloat(target_amount), deadline || null, icon || null]);
    res.status(201).json({ success: true, message: 'Финансовая цель успешно добавлена', goal: result.rows[0] });
  } catch (error) { console.error('Ошибка при добавлении цели:', error); res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при добавлении цели' }); }
});

// GET /api/goals
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { page: queryPage, limit: queryLimit, sortBy, sortOrder, achieved, deadlineStart, deadlineEnd } = req.query;
  // Pagination & Sorting (as before) ...
  const page = parseInt(queryPage || '1', 10); const limit = parseInt(queryLimit || '10', 10); /* ... */ const offset = (page - 1) * limit;
  const allowedSortBy = ['name', 'target_amount', 'current_amount', 'deadline', 'created_at', 'updated_at']; const allowedSortOrder = ['ASC', 'DESC']; const validSortBy = allowedSortBy.includes(sortBy) ? `"${sortBy}"` : '"created_at"'; const validSortOrder = allowedSortOrder.includes(String(sortOrder).toUpperCase()) ? String(sortOrder).toUpperCase() : 'DESC';
  // Filtering
  let filterConditions = []; let queryParams = [userId]; const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (achieved === 'true' || achieved === 'false') { const condition = achieved === 'true' ? 'current_amount >= target_amount' : 'current_amount < target_amount'; filterConditions.push(condition); }
  if (deadlineStart && dateRegex.test(deadlineStart)) { queryParams.push(deadlineStart); filterConditions.push(`deadline::DATE >= $${queryParams.length}`); }
  if (deadlineEnd && dateRegex.test(deadlineEnd)) { queryParams.push(deadlineEnd); filterConditions.push(`deadline::DATE <= $${queryParams.length}`); }
  const whereClause = filterConditions.length > 0 ? `AND ${filterConditions.join(' AND ')}` : '';
  // End Filtering
  try {
    const selectQuery = `
      SELECT id, user_id, name, target_amount, current_amount, deadline, icon, created_at, updated_at
      FROM goals -- ИЗМЕНЕНО
      WHERE user_id = $1 ${whereClause}
      ORDER BY ${validSortBy} ${validSortOrder}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2};
    `;
    const countQuery = ` SELECT COUNT(*) FROM goals WHERE user_id = $1 ${whereClause}; `; // ИЗМЕНЕНО
    const countQueryParams = [...queryParams]; const selectQueryParams = [...queryParams, limit, offset];
    const [goalsResult, countResult] = await Promise.all([ pool.query(selectQuery, selectQueryParams), pool.query(countQuery, countQueryParams) ]);
    const totalGoals = parseInt(countResult.rows[0].count, 10); const totalPages = Math.ceil(totalGoals / limit);
    res.status(200).json({
      success: true, pagination: { /* ... */ }, filtersApplied: { /* ... */ }, goals: goalsResult.rows
    });
  } catch (error) { console.error('Ошибка при получении целей:', error); res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при получении целей' }); }
});

// PATCH /api/goals/:id
router.patch('/:id', authenticateToken, async (req, res) => {
  const userId = req.user.userId; const goalId = req.params.id; const updates = req.body;
  const allowedUpdates = ['name', 'target_amount', 'current_amount', 'deadline', 'icon']; const updatesKeys = Object.keys(updates || {}); const isValidOperation = typeof updates === 'object' && updates !== null && updatesKeys.length > 0 && updatesKeys.every(key => allowedUpdates.includes(key));
  if (!isValidOperation) { return res.status(400).json({ success: false, message: 'Недопустимые, пустые или неверные поля для обновления' }); }
  // Validation...
  if (updates.hasOwnProperty('target_amount') && (isNaN(parseFloat(updates.target_amount)) || parseFloat(updates.target_amount) <= 0)) { /* ... */ } if (updates.hasOwnProperty('current_amount') && (isNaN(parseFloat(updates.current_amount)) || parseFloat(updates.current_amount) < 0)) { /* ... */ } const dateRegex = /^\d{4}-\d{2}-\d{2}$/; if (updates.hasOwnProperty('deadline') && updates.deadline !== null && !dateRegex.test(updates.deadline)) { /* ... */ }
  // End validation
  try {
    let setClause = updatesKeys.map((key, index) => `"${key}" = $${index + 2}`).join(', '); setClause += ', updated_at = CURRENT_TIMESTAMP';
    const updateQuery = ` UPDATE goals SET ${setClause} WHERE id = $1 AND user_id = $${updatesKeys.length + 2} RETURNING *; `; // ИЗМЕНЕНО
    const queryParams = [goalId, ...Object.values(updates), userId]; const result = await pool.query(updateQuery, queryParams);
    if (result.rows.length === 0) { return res.status(404).json({ success: false, message: 'Цель не найдена или не принадлежит вам' }); }
    res.status(200).json({ success: true, message: 'Цель успешно обновлена', goal: result.rows[0] });
  } catch (error) { console.error('Ошибка при обновлении цели:', error); res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при обновлении цели' }); }
});

// DELETE /api/goals/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  const userId = req.user.userId; const goalId = req.params.id;
  try {
    const deleteQuery = ` DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING id; `; // ИЗМЕНЕНО
    const result = await pool.query(deleteQuery, [goalId, userId]);
    if (result.rowCount === 0) { return res.status(404).json({ success: false, message: 'Цель не найдена или не принадлежит вам' }); }
    res.status(200).json({ success: true, message: 'Цель успешно удалена', deletedGoalId: goalId });
  } catch (error) { console.error('Ошибка при удалении цели:', error); res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при удалении цели' }); }
});

module.exports = router;