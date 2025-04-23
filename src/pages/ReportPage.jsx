// src/pages/ReportPage.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import apiClient from '../services/api';
import '../styles/reportPage.css';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
// --- ИМПОРТИРУЕМ ХЕЛПЕР ---
import { formatCurrency } from '../utils/formatting';

ChartJS.register( CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend );

const knownColors = {
    'Food': '#8b5cf6', 'Activities': '#3b82f6', 'Transport': '#facc15',
    'Entertainment': '#22c55e', 'Household expenses': '#ef4444',
    'Automobile': '#f97316', 'Renting a home': '#0ea5e9',
    'Cosmetics': '#ec4899', 'Hobby': '#14b8a6', 'Хобби': '#14b8a6'
};
const defaultColor = '#cccccc';

function ReportPage() {
    const categoryColorsRef = useRef({});
    const getColorForCategory = useCallback((category) => {
        const catKey = category || 'Uncategorized';
        if (knownColors[catKey]) return knownColors[catKey];
        if (categoryColorsRef.current[catKey]) return categoryColorsRef.current[catKey];
        let hash = 0;
        for (let i = 0; i < catKey.length; i++) { hash = catKey.charCodeAt(i) + ((hash << 5) - hash); hash = hash & hash; }
        const color = `hsl(${hash % 360}, 60%, 70%)`;
        categoryColorsRef.current[catKey] = color;
        return color || defaultColor;
    }, []);

    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const formatDate = (date) => date.toISOString().split('T')[0];
        setStartDate(formatDate(firstDay));
        setEndDate(formatDate(lastDay));
    }, []);

    const fetchTransactionsForPeriod = useCallback(async () => {
        if (!startDate || !endDate) return;
        setIsLoading(true); setError(null); setTransactions([]);
        try {
            const response = await apiClient.get('/transactions', { params: { startDate, endDate, limit: 1000 } });
            if (response.data?.success && Array.isArray(response.data.transactions)) { setTransactions(response.data.transactions); }
            else { throw new Error('Invalid data received for transactions'); }
        } catch (err) { console.error("Failed to fetch transactions for report:", err); setError(err.response?.data?.message || err.message || 'Не удалось загрузить транзакции для отчета.'); }
        finally { setIsLoading(false); }
    }, [startDate, endDate]);

    useEffect(() => { fetchTransactionsForPeriod(); }, [fetchTransactionsForPeriod]);

    const chartData = useMemo(() => {
        const expenses = transactions.filter(tx => tx.type === 'expense');
        if (expenses.length === 0) return { labels: [], datasets: [] };
        const datesInRange = []; let currentDate = new Date(startDate); const lastDate = new Date(endDate);
        while (currentDate <= lastDate) { datesInRange.push(new Date(currentDate)); currentDate.setDate(currentDate.getDate() + 1); }
        const labels = datesInRange.map(date => date.toLocaleDateString('en-US', { day: 'numeric' }));
        const dateKeys = datesInRange.map(date => date.toISOString().split('T')[0]);
        const categories = [...new Set(expenses.map(tx => tx.category || 'Uncategorized'))];
        const dailyCategoryExpenses = {};
        dateKeys.forEach(dateKey => { dailyCategoryExpenses[dateKey] = {}; categories.forEach(cat => { dailyCategoryExpenses[dateKey][cat] = 0; }); });
        expenses.forEach(tx => { const dateKey = new Date(tx.date).toISOString().split('T')[0]; const category = tx.category || 'Uncategorized'; if (dateKey in dailyCategoryExpenses && dailyCategoryExpenses[dateKey].hasOwnProperty(category)) { dailyCategoryExpenses[dateKey][category] += parseFloat(tx.amount || 0); } });
        const datasets = categories.map(category => ({ label: category, data: dateKeys.map(dateKey => dailyCategoryExpenses[dateKey]?.[category] || 0), backgroundColor: getColorForCategory(category), }));
        return { labels, datasets };
    }, [transactions, startDate, endDate, getColorForCategory]);

    const categorySummaryData = useMemo(() => {
        const expenses = transactions.filter(tx => tx.type === 'expense');
        const totalExpenses = expenses.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
        const categoriesSummary = expenses.reduce((acc, tx) => { const category = tx.category || 'Uncategorized'; if (!acc[category]) { acc[category] = { amount: 0, color: getColorForCategory(category) }; } acc[category].amount += parseFloat(tx.amount || 0); return acc; }, {});
        return Object.entries(categoriesSummary).map(([category, data]) => ({ category, amount: data.amount, color: data.color, percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0, })).sort((a, b) => b.amount - a.amount);
    }, [transactions, getColorForCategory]);

    // --- Опции графика (изменяем callback) ---
    const chartOptions = useMemo(() => ({
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { display: false }, title: { display: false },
            tooltip: {
                mode: 'index', intersect: false,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || ''; if (label) { label += ': '; }
                        if (context.parsed.y !== null) {
                            // --- ИСПОЛЬЗУЕМ хелпер ---
                            label += formatCurrency(context.parsed.y);
                        } return label;
                    }
                }
            }
        },
        scales: {
            y: { beginAtZero: true, stacked: true, ticks: {
                    callback: function(value) {
                        // --- ИСПОЛЬЗУЕМ хелпер ---
                        return formatCurrency(value);
                    }
                 } },
            x: { stacked: true, grid: { display: false } }
        }
    }), []); // Зависимость пустая, т.к. formatCurrency не зависит от состояния

    return (
        <div className="report-page-container">
            <div className="report-content-container">
                 <div className="report-period-selector"> <p><strong>Report for:</strong>{' '}{startDate}{' '}<strong>to</strong>{' '}{endDate}</p> </div>
                 <div className="chart-container"> {/* График */}
                     {isLoading && <p className="loading-message">Loading chart data...</p>}
                     {!isLoading && error && <p className="error-message">{error}</p>}
                     {!isLoading && !error && ( chartData.datasets.length > 0 ? ( <div style={{ position: 'relative', height: '300px' }}> <Bar options={chartOptions} data={chartData} /> </div> ) : ( <p className="no-data-message">No expense data for chart in this period.</p> ) )}
                 </div>
                 <div className="category-summary-list"> {/* Список категорий */}
                     {isLoading && <p className="loading-message">Loading categories...</p>}
                     {!isLoading && !error && (
                        categorySummaryData.length > 0 ? (
                            categorySummaryData.map(item => (
                                <div key={item.category} className="category-summary-item">
                                    <div className="category-info">
                                        <span className="category-name">{item.category}</span>
                                        <span className="category-amount">
                                             {/* --- ИСПОЛЬЗУЕМ хелпер --- */}
                                             {formatCurrency(item.amount)}
                                        </span>
                                    </div>
                                     <div className="progress-bar-container"> <div className="progress-bar-fg" style={{ width: `${item.percentage}%`, backgroundColor: item.color }} ></div> </div>
                                </div>
                            ))
                        ) : ( <p className="no-data-message">No expenses recorded for this period.</p> )
                     )}
                 </div>
                 {/* Возможное отображение итогов здесь */}
            </div>
        </div>
    );
}

export default ReportPage;