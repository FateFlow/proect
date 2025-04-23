// Файл: backend/routes/bills.js
const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const pool = require('../db/pool');

const router = express.Router();

// POST /api/bills
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { name, amount, due_date, period, category, notes } = req.body;
  // --- Валидация ---
  if (!name || !amount || !due_date || !period) { return res.status(400).json({ success: false, message: 'Поля name, amount, due_date, period обязательны' }); }
  if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) { return res.status(400).json({ success: false, message: 'Поле amount должно быть положительным числом' }); }
  const allowedPeriods = ['month', 'week', 'year', 'once']; if (!allowedPeriods.includes(period)) { return res.status(400).json({ success: false, message: `Поле period должно быть одним из: ${allowedPeriods.join(', ')}` }); }
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/; if (!dateRegex.test(due_date)) { return res.status(400).json({ success: false, message: 'Поле due_date должно быть в формате YYYY-MM-DD' }); }
  // --- Конец Валидации ---
  try {
    const insertQuery = `
      INSERT INTO bills (user_id, name, amount, due_date, period, category, notes) -- ИЗМЕНЕНО
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, user_id, name, amount, due_date, period, paid, category, notes, created_at, updated_at;
    `;
    const result = await pool.query(insertQuery, [userId, name, parseFloat(amount), due_date, period, category, notes]);
    res.status(201).json({ success: true, message: 'Счет успешно добавлен', bill: result.rows[0] });
  } catch (error) { console.error('Ошибка при добавлении счета:', error); res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при добавлении счета' }); }
});

// GET /api/bills
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { page: queryPage, limit: queryLimit, sortBy, sortOrder, paid, period, dueDateStart, dueDateEnd } = req.query;
  // Пагинация и Сортировка (как было) ...
  const page = parseInt(queryPage || '1', 10); const limit = parseInt(queryLimit || '10', 10); /* ... */ const offset = (page - 1) * limit;
  const allowedSortBy = ['due_date', 'name', 'amount', 'period', 'category', 'paid', 'created_at']; const allowedSortOrder = ['ASC', 'DESC']; const validSortBy = allowedSortBy.includes(sortBy) ? `"${sortBy}"` : '"due_date"'; const validSortOrder = allowedSortOrder.includes(String(sortOrder).toUpperCase()) ? String(sortOrder).toUpperCase() : 'ASC';
  // Фильтрация
  let filterConditions = []; let queryParams = [userId]; const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (paid === 'true' || paid === 'false') { queryParams.push(paid === 'true'); filterConditions.push(`paid = $${queryParams.length}`); }
  const allowedPeriods = ['month', 'week', 'year', 'once']; if (period && allowedPeriods.includes(period)) { queryParams.push(period); filterConditions.push(`period = $${queryParams.length}`); }
  if (dueDateStart && dateRegex.test(dueDateStart)) { queryParams.push(dueDateStart); filterConditions.push(`due_date::DATE >= $${queryParams.length}`); }
  if (dueDateEnd && dateRegex.test(dueDateEnd)) { queryParams.push(dueDateEnd); filterConditions.push(`due_date::DATE <= $${queryParams.length}`); }
  const whereClause = filterConditions.length > 0 ? `AND ${filterConditions.join(' AND ')}` : '';
  // --- Конец Фильтрации ---
  try {
    const selectQuery = `
      SELECT id, user_id, name, amount, due_date, period, paid, category, notes, created_at, updated_at
      FROM bills -- ИЗМЕНЕНО
      WHERE user_id = $1 ${whereClause}
      ORDER BY ${validSortBy} ${validSortOrder}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2};
    `;
    const countQuery = ` SELECT COUNT(*) FROM bills WHERE user_id = $1 ${whereClause}; `; // ИЗМЕНЕНО
    const countQueryParams = [...queryParams]; const selectQueryParams = [...queryParams, limit, offset];
    const [billsResult, countResult] = await Promise.all([ pool.query(selectQuery, selectQueryParams), pool.query(countQuery, countQueryParams) ]);
    const totalBills = parseInt(countResult.rows[0].count, 10); const totalPages = Math.ceil(totalBills / limit);
    res.status(200).json({
      success: true, pagination: { currentPage: page, limit: limit, totalPages: totalPages, totalCount: totalBills },
      filtersApplied: { /* ... */ }, bills: billsResult.rows
    });
  } catch (error) { console.error('Ошибка при получении счетов:', error); res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при получении счетов' }); }
});

// PATCH /api/bills/:id
router.patch('/:id', authenticateToken, async (req, res) => {
  const userId = req.user.userId; const billId = req.params.id; const updates = req.body;
  const allowedUpdates = ['name', 'amount', 'due_date', 'period', 'paid', 'category', 'notes']; const updatesKeys = Object.keys(updates || {}); const isValidOperation = typeof updates === 'object' && updates !== null && updatesKeys.length > 0 && updatesKeys.every(key => allowedUpdates.includes(key));
  if (!isValidOperation) { return res.status(400).json({ success: false, message: 'Недопустимые или пустые поля для обновления' }); }
  // Валидация (как было) ...
  if (updates.hasOwnProperty('amount') && (isNaN(parseFloat(updates.amount)) || parseFloat(updates.amount) <= 0)) { /* ... */ } if (updates.hasOwnProperty('paid') && typeof updates.paid !== 'boolean') { /* ... */ } const dateRegex = /^\d{4}-\d{2}-\d{2}$/; if (updates.hasOwnProperty('due_date') && !dateRegex.test(updates.due_date)) { /* ... */ } const allowedPeriods = ['month', 'week', 'year', 'once']; if (updates.hasOwnProperty('period') && !allowedPeriods.includes(updates.period)) { /* ... */ }
  try {
    let setClause = updatesKeys.map((key, index) => `"${key}" = $${index + 2}`).join(', '); setClause += ', updated_at = CURRENT_TIMESTAMP';
    const updateQuery = ` UPDATE bills SET ${setClause} WHERE id = $1 AND user_id = $${updatesKeys.length + 2} RETURNING *; `; // ИЗМЕНЕНО
    const queryParams = [billId, ...Object.values(updates), userId]; const result = await pool.query(updateQuery, queryParams);
    if (result.rows.length === 0) { return res.status(404).json({ success: false, message: 'Счет не найден или не принадлежит вам' }); }
    res.status(200).json({ success: true, message: 'Счет успешно обновлен', bill: result.rows[0] });
  } catch (error) { console.error('Ошибка при обновлении счета:', error); res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при обновлении счета' }); }
});

// DELETE /api/bills/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  const userId = req.user.userId; const billId = req.params.id;
  try {
    const deleteQuery = ` DELETE FROM bills WHERE id = $1 AND user_id = $2 RETURNING id; `; // ИЗМЕНЕНО
    const result = await pool.query(deleteQuery, [billId, userId]);
    if (result.rowCount === 0) { return res.status(404).json({ success: false, message: 'Счет не найден или не принадлежит вам' }); }
    res.status(200).json({ success: true, message: 'Счет успешно удален', deletedBillId: billId });
  } catch (error) { console.error('Ошибка при удалении счета:', error); res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при удалении счета' }); }
});

module.exports = router;