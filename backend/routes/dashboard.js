// Файл: backend/routes/dashboard.js
const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const pool = require('../db/pool');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  try {
    const summaryQuery = `
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as total_balance,
        COALESCE(SUM(CASE WHEN type = 'income' AND "date" >= $2 AND "date" <= $3 THEN amount ELSE 0 END), 0) as monthly_income,
        COALESCE(SUM(CASE WHEN type = 'expense' AND "date" >= $2 AND "date" <= $3 THEN amount ELSE 0 END), 0) as monthly_expense
      FROM transactions
      WHERE user_id = $1;
    `;

    const recentTransactionsQuery = `
      SELECT id, type, amount, category, "date", notes
      FROM transactions
      WHERE user_id = $1
      ORDER BY "date" DESC
      LIMIT 5;
    `;

    const activeGoalsQuery = `
      SELECT COUNT(*) as active_goals_count
      FROM goals
      WHERE user_id = $1 AND current_amount < target_amount;
    `;

    const unpaidBillsQuery = `
        SELECT COUNT(*) as unpaid_bills_count
        FROM bills
        WHERE user_id = $1 AND paid = false;
    `;

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

    const summaryData = summaryResult.rows[0] || {};
    const activeGoalsData = activeGoalsResult.rows[0] || {};
    const unpaidBillsData = unpaidBillsResult.rows[0] || {};

    const dashboardData = {
      success: true,
      // --- ИЗМЕНЕНО: Отправляем как числа ---
      balance: parseFloat(summaryData.total_balance || 0),
      monthly_income: parseFloat(summaryData.monthly_income || 0),
      monthly_expense: parseFloat(summaryData.monthly_expense || 0),
      // --- КОНЕЦ ИЗМЕНЕНИЙ ---
      recentTransactions: recentTransactionsResult.rows,
      active_goals_count: parseInt(activeGoalsData.active_goals_count || 0),
      unpaid_bills_count: parseInt(unpaidBillsData.unpaid_bills_count || 0)
    };

    console.log('Sending dashboard data for user:', userId, dashboardData);
    res.status(200).json(dashboardData);

  } catch (error) {
    console.error(`Ошибка при получении данных для дашборда user ID ${userId}:`, error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при получении данных дашборда' });
  }
});

module.exports = router;