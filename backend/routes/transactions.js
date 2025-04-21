// Файл: backend/routes/transactions.js
const express = require('express');
const authenticateToken = require('../middleware/authenticateToken'); // Наше middleware для проверки токена
const pool = require('../db/pool');

const router = express.Router();

// --- Маршрут для добавления новой транзакции ---
// POST /api/transactions
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { type, amount, category, date, notes } = req.body;

  // Валидация
  if (!type || !amount || !category || !date) {
    return res.status(400).json({ success: false, message: 'Поля type, amount, category, date обязательны' });
  }
  if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ success: false, message: 'Поле type должно быть "income" или "expense"' });
  }
  if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Поле amount должно быть положительным числом' });
  }

  try {
    const insertQuery = `
      INSERT INTO Transactions (user_id, type, amount, category, date, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, user_id, type, amount, category, date, notes, created_at;
    `;
    const result = await pool.query(insertQuery, [userId, type, parseFloat(amount), category, date, notes]);
    res.status(201).json({
      success: true,
      message: 'Транзакция успешно добавлена',
      transaction: result.rows[0]
    });
  } catch (error) {
    console.error('Ошибка при добавлении транзакции:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при добавлении транзакции' });
  }
});


// --- Маршрут: Получение списка транзакций пользователя (с пагинацией и фильтрами) ---
// GET /api/transactions?page=1&limit=10&sortBy=date&sortOrder=DESC&type=expense&category=Продукты&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { page: queryPage, limit: queryLimit, sortBy, sortOrder, type, category, startDate, endDate } = req.query;

  // Пагинация
  const page = parseInt(queryPage || '1', 10);
  const limit = parseInt(queryLimit || '10', 10);
  if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
    return res.status(400).json({ success: false, message: 'Параметры page и limit должны быть положительными числами' });
  }
  const offset = (page - 1) * limit;

  // Сортировка
  const allowedSortBy = ['date', 'amount', 'created_at', 'category', 'type'];
  const allowedSortOrder = ['ASC', 'DESC'];
  const validSortBy = allowedSortBy.includes(sortBy) ? sortBy : 'date';
  const validSortOrder = allowedSortOrder.includes(String(sortOrder).toUpperCase()) ? String(sortOrder).toUpperCase() : 'DESC';

  // --- Фильтрация ---
  let filterConditions = [];
  let queryParams = [userId]; // $1 = userId

  if (type === 'income' || type === 'expense') {
    queryParams.push(type); // Добавляем значение для type
    filterConditions.push(`type = $${queryParams.length}`); // $2 = type
  }
  if (category) {
    queryParams.push(category); // Добавляем значение для category
    filterConditions.push(`category = $${queryParams.length}`); // $3 = category
  }
  // Простая валидация формата даты
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (startDate && dateRegex.test(startDate)) {
      queryParams.push(startDate);
      filterConditions.push(`date >= $${queryParams.length}`); // $4 = startDate
  }
  if (endDate && dateRegex.test(endDate)) {
      queryParams.push(endDate);
      // Включаем весь день endDate (до 23:59:59.999)
      // Приводим дату к типу DATE в БД для корректного сравнения <=
      filterConditions.push(`date::DATE <= $${queryParams.length}`); // $5 = endDate
  }

  // Собираем строку WHERE
  const whereClause = filterConditions.length > 0 ? `AND ${filterConditions.join(' AND ')}` : '';
  // --- Конец Фильтрации ---

  try {
    // --- Запрос для получения транзакций ТЕКУЩЕЙ страницы ---
    const selectQuery = `
      SELECT id, user_id, type, amount, category, date, notes, created_at
      FROM Transactions
      WHERE user_id = $1 ${whereClause} -- Добавляем фильтры
      ORDER BY ${validSortBy} ${validSortOrder}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}; -- Параметры для LIMIT/OFFSET идут последними
    `;

    // --- Запрос для получения ОБЩЕГО количества транзакций (с учетом фильтров!) ---
    const countQuery = `
      SELECT COUNT(*) FROM Transactions WHERE user_id = $1 ${whereClause};
    `;

    // --- Выполняем оба запроса ---
    // Копируем параметры фильтрации для countQuery
    const countQueryParams = [...queryParams];
    // Добавляем параметры limit и offset для selectQuery
    const selectQueryParams = [...queryParams, limit, offset];

    const [transactionsResult, countResult] = await Promise.all([
        pool.query(selectQuery, selectQueryParams),
        pool.query(countQuery, countQueryParams)
    ]);

    const totalTransactions = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalTransactions / limit);

    // --- Отправляем ответ ---
    res.status(200).json({
      success: true,
      pagination: {
        currentPage: page,
        limit: limit,
        totalPages: totalPages,
        totalCount: totalTransactions
      },
      filtersApplied: { // Показываем, какие фильтры применены
            type: type || null,
            category: category || null,
            startDate: startDate || null,
            endDate: endDate || null
      },
      transactions: transactionsResult.rows
    });

  } catch (error) {
    console.error('Ошибка при получении транзакций (с фильтрами):', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при получении транзакций' });
  }
});


// --- Маршрут для обновления транзакции ---
// PATCH /api/transactions/:id
router.patch('/:id', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const transactionId = req.params.id;
  const updates = req.body;

  const allowedUpdates = ['type', 'amount', 'category', 'date', 'notes'];
  const updatesKeys = Object.keys(updates || {});

  const isValidOperation = typeof updates === 'object' && updates !== null && updatesKeys.length > 0 && updatesKeys.every(key => allowedUpdates.includes(key));

  if (!isValidOperation) {
    return res.status(400).json({ success: false, message: 'Недопустимые, пустые или неверные поля для обновления' });
  }

  // Валидация
  if (updates.hasOwnProperty('type') && updates.type !== 'income' && updates.type !== 'expense') {
     return res.status(400).json({ success: false, message: 'Поле type должно быть "income" или "expense"' });
  }
  if (updates.hasOwnProperty('amount') && (isNaN(parseFloat(updates.amount)) || parseFloat(updates.amount) <= 0)) {
     return res.status(400).json({ success: false, message: 'Поле amount должно быть положительным числом' });
  }

  try {
    let setClause = updatesKeys
      .map((key, index) => `"${key}" = $${index + 2}`)
      .join(', ');

    const updateQuery = `
      UPDATE Transactions
      SET ${setClause}
      WHERE id = $1 AND user_id = $${updatesKeys.length + 2}
      RETURNING *;
    `;
    const queryParams = [transactionId, ...Object.values(updates), userId];
    const result = await pool.query(updateQuery, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Транзакция не найдена или не принадлежит вам' });
    }

    res.status(200).json({
      success: true,
      message: 'Транзакция успешно обновлена',
      transaction: result.rows[0]
    });
  } catch (error) {
    console.error('Ошибка при обновлении транзакции:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при обновлении транзакции' });
  }
});


// --- Маршрут для удаления транзакции ---
// DELETE /api/transactions/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const transactionId = req.params.id;

  try {
    const deleteQuery = `
      DELETE FROM Transactions
      WHERE id = $1 AND user_id = $2
      RETURNING id;
    `;
    const result = await pool.query(deleteQuery, [transactionId, userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Транзакция не найдена или не принадлежит вам' });
    }

    res.status(200).json({ success: true, message: 'Транзакция успешно удалена', deletedTransactionId: transactionId });
  } catch (error) {
    console.error('Ошибка при удалении транзакции:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при удалении транзакции' });
  }
});


module.exports = router; // Экспортируем роутер в конце файла