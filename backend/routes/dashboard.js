// Файл: backend/routes/dashboard.js
const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const pool = require('../db/pool');

const router = express.Router();

// --- Маршрут для получения данных дашборда ---
// GET /api/dashboard
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  // Определяем начало и конец текущего месяца (пример)
  // В реальном приложении может потребоваться более гибкая логика или параметры запроса
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Первый день текущего месяца
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Последний день текущего месяца

  try {
    // --- Здесь будут наши SQL запросы для сбора данных ---

    // 1. Запрос для расчета баланса, доходов и расходов за месяц
    const summaryQuery = `
      SELECT
        -- Общий баланс (все доходы минус все расходы)
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_balance,

        -- Доходы за текущий месяц
        COALESCE(SUM(CASE WHEN type = 'income' AND date >= $2 AND date <= $3 THEN amount ELSE 0 END), 0) as monthly_income,

        -- Расходы за текущий месяц
        COALESCE(SUM(CASE WHEN type = 'expense' AND date >= $2 AND date <= $3 THEN amount ELSE 0 END), 0) as monthly_expense
      FROM Transactions
      WHERE user_id = $1;
    `;

    // 2. Запрос для получения последних 5 транзакций
    const recentTransactionsQuery = `
      SELECT id, type, amount, category, date, notes
      FROM Transactions
      WHERE user_id = $1
      ORDER BY date DESC, created_at DESC -- Сначала самые новые по дате, потом по времени создания
      LIMIT 5;
    `;

    // (Опционально) 3. Запрос для количества активных целей
    const activeGoalsQuery = `
      SELECT COUNT(*) as active_goals_count
      FROM Goals
      WHERE user_id = $1 AND current_amount < target_amount; -- Считаем цели, которые еще не достигнуты
    `;

    // (Опционально) 4. Запрос для количества неоплаченных счетов
    const unpaidBillsQuery = `
        SELECT COUNT(*) as unpaid_bills_count
        FROM Bills
        WHERE user_id = $1 AND paid = false;
    `;


    // --- Выполняем запросы параллельно для эффективности ---
    const [
        summaryResult,
        recentTransactionsResult,
        activeGoalsResult,
        unpaidBillsResult
    ] = await Promise.all([
        pool.query(summaryQuery, [userId, startDate, endDate]),
        pool.query(recentTransactionsQuery, [userId]),
        pool.query(activeGoalsQuery, [userId]),
        pool.query(unpaidBillsQuery, [userId])
    ]);


    // --- Формируем ответ ---
    const dashboardData = {
      success: true,
      balance: parseFloat(summaryResult.rows[0].total_balance || 0).toFixed(2),
      monthly_income: parseFloat(summaryResult.rows[0].monthly_income || 0).toFixed(2),
      monthly_expense: parseFloat(summaryResult.rows[0].monthly_expense || 0).toFixed(2),
      recent_transactions: recentTransactionsResult.rows,
      active_goals_count: parseInt(activeGoalsResult.rows[0].active_goals_count || 0),
      unpaid_bills_count: parseInt(unpaidBillsResult.rows[0].unpaid_bills_count || 0)
    };

    res.status(200).json(dashboardData);


  } catch (error) {
    console.error('Ошибка при получении данных для дашборда:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при получении данных дашборда' });
  }
});

module.exports = router;