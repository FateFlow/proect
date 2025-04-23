// Файл: backend/routes/transactions.js
const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const pool = require('../db/pool');

const router = express.Router();

// POST /api/transactions
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { type, amount, category, date, notes } = req.body;

  // Validation checks...
  if (!type || !amount || !category || !date) { /* ... */ }
  if (type !== 'income' && type !== 'expense') { /* ... */ }
  if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) { /* ... */ }

  try {
    const insertQuery = `
      INSERT INTO transactions (user_id, type, amount, category, "date", notes) -- ИЗМЕНЕНО
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, user_id, type, amount, category, "date", notes, created_at; -- ИЗМЕНЕНО
    `;
    const result = await pool.query(insertQuery, [userId, type, parseFloat(amount), category, date, notes]);
    res.status(201).json({ success: true, message: 'Транзакция успешно добавлена', transaction: result.rows[0] });
  } catch (error) {
    console.error('Ошибка при добавлении транзакции:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при добавлении транзакции' });
  }
});

// GET /api/transactions (с пагинацией и фильтрами)
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { page: queryPage, limit: queryLimit, sortBy, sortOrder, type, category, startDate, endDate } = req.query;
  const page = parseInt(queryPage || '1', 10);
  const limit = parseInt(queryLimit || '10', 10);
  if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) { /* ... */ }
  const offset = (page - 1) * limit;
  const allowedSortBy = ['date', 'amount', 'created_at', 'category', 'type'];
  const allowedSortOrder = ['ASC', 'DESC'];
  const validSortBy = allowedSortBy.includes(sortBy) ? `"${sortBy}"` : '"date"'; // Добавил кавычки для имен столбцов
  const validSortOrder = allowedSortOrder.includes(String(sortOrder).toUpperCase()) ? String(sortOrder).toUpperCase() : 'DESC';

  let filterConditions = [];
  let queryParams = [userId];
  // --- Логика фильтрации ---
  if (type === 'income' || type === 'expense') { queryParams.push(type); filterConditions.push(`type = $${queryParams.length}`); }
  if (category) { queryParams.push(category); filterConditions.push(`category = $${queryParams.length}`); }
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (startDate && dateRegex.test(startDate)) { queryParams.push(startDate); filterConditions.push(`"date"::DATE >= $${queryParams.length}`); } // ::DATE для сравнения
  if (endDate && dateRegex.test(endDate)) { queryParams.push(endDate); filterConditions.push(`"date"::DATE <= $${queryParams.length}`); } // ::DATE для сравнения
  const whereClause = filterConditions.length > 0 ? `AND ${filterConditions.join(' AND ')}` : '';
  // --- Конец фильтрации ---

  try {
    const selectQuery = `
      SELECT id, user_id, type, amount, category, "date", notes, created_at -- ИЗМЕНЕНО
      FROM transactions -- ИЗМЕНЕНО
      WHERE user_id = $1 ${whereClause}
      ORDER BY ${validSortBy} ${validSortOrder}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2};
    `;

    const countQuery = `
      SELECT COUNT(*) FROM transactions WHERE user_id = $1 ${whereClause}; -- ИЗМЕНЕНО
    `;

    const countQueryParams = [...queryParams];
    const selectQueryParams = [...queryParams, limit, offset];

    const [transactionsResult, countResult] = await Promise.all([
        pool.query(selectQuery, selectQueryParams),
        pool.query(countQuery, countQueryParams)
    ]);

    const totalTransactions = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalTransactions / limit);

    res.status(200).json({
      success: true,
      pagination: { currentPage: page, limit: limit, totalPages: totalPages, totalCount: totalTransactions },
      filtersApplied: { type: type || null, category: category || null, startDate: startDate || null, endDate: endDate || null },
      transactions: transactionsResult.rows // Отправляем массив транзакций
    });
  } catch (error) {
    console.error('Ошибка при получении транзакций:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при получении транзакций' });
  }
});

// PATCH /api/transactions/:id
router.patch('/:id', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const transactionId = req.params.id;
  const updates = req.body;
  const allowedUpdates = ['type', 'amount', 'category', 'date', 'notes'];
  const updatesKeys = Object.keys(updates || {});
  const isValidOperation = typeof updates === 'object' && updates !== null && updatesKeys.length > 0 && updatesKeys.every(key => allowedUpdates.includes(key));
  if (!isValidOperation) { /* ... */ }
  if (updates.hasOwnProperty('type') && updates.type !== 'income' && updates.type !== 'expense') { /* ... */ }
  if (updates.hasOwnProperty('amount') && (isNaN(parseFloat(updates.amount)) || parseFloat(updates.amount) <= 0)) { /* ... */ }

  try {
    let setClause = updatesKeys.map((key, index) => `"${key}" = $${index + 2}`).join(', ');
    const updateQuery = `
      UPDATE transactions -- ИЗМЕНЕНО
      SET ${setClause}
      WHERE id = $1 AND user_id = $${updatesKeys.length + 2}
      RETURNING *;
    `;
    const queryParams = [transactionId, ...Object.values(updates), userId];
    const result = await pool.query(updateQuery, queryParams);
    if (result.rows.length === 0) { /* ... */ }
    res.status(200).json({ success: true, message: 'Транзакция успешно обновлена', transaction: result.rows[0] });
  } catch (error) {
    console.error('Ошибка при обновлении транзакции:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при обновлении транзакции' });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const transactionId = req.params.id;
  try {
    const deleteQuery = `
      DELETE FROM transactions -- ИЗМЕНЕНО
      WHERE id = $1 AND user_id = $2
      RETURNING id;
    `;
    const result = await pool.query(deleteQuery, [transactionId, userId]);
    if (result.rowCount === 0) { /* ... */ }
    res.status(200).json({ success: true, message: 'Транзакция успешно удалена', deletedTransactionId: transactionId });
  } catch (error) {
    console.error('Ошибка при удалении транзакции:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при удалении транзакции' });
  }
});

module.exports = router;