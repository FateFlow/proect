// Файл: backend/routes/reports.js
const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const pool = require('../db/pool');

const router = express.Router();

// --- Маршрут для получения сводного отчета по расходам ---
// GET /api/reports/summary?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/summary', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query; // Получаем даты из параметров запроса

    // --- Валидация дат ---
    if (!startDate || !endDate) {
        return res.status(400).json({ success: false, message: 'Параметры startDate и endDate обязательны' });
    }
    // Простая проверка формата YYYY-MM-DD (можно улучшить регулярным выражением)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({ success: false, message: 'Даты должны быть в формате YYYY-MM-DD' });
    }
    // --- Конец Валидации ---

    try {
        // Запрос для суммирования расходов по категориям за период
        const reportQuery = `
            SELECT
                category,
                SUM(amount) as total_amount
            FROM Transactions
            WHERE
                user_id = $1
                AND type = 'expense' -- Считаем только расходы
                AND date >= $2 -- Начало периода (включая)
                AND date <= $3 -- Конец периода (включая)
            GROUP BY category -- Группируем по категории
            ORDER BY total_amount DESC; -- Сортируем по убыванию суммы
        `;

        const result = await pool.query(reportQuery, [userId, startDate, endDate]);

        // Запрос для получения общих сумм доходов и расходов за тот же период
        const totalsQuery = `
             SELECT
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
             FROM Transactions
             WHERE user_id = $1 AND date >= $2 AND date <= $3;
        `;
        const totalsResult = await pool.query(totalsQuery, [userId, startDate, endDate]);

        res.status(200).json({
            success: true,
            report: {
                startDate: startDate,
                endDate: endDate,
                expensesByCategory: result.rows, // Массив { category: '...', total_amount: '...' }
                totalIncome: parseFloat(totalsResult.rows[0].total_income || 0).toFixed(2),
                totalExpense: parseFloat(totalsResult.rows[0].total_expense || 0).toFixed(2)
            }
        });

    } catch (error) {
        console.error('Ошибка при получении отчета:', error);
        res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при получении отчета' });
    }
});


module.exports = router;