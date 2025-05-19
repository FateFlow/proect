// src/pages/ReportPage.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import apiClient from '../services/api';
import '../styles/reportPage.css'; // Убедись, что этот файл существует и стили ниже будут в нем
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useCurrency } from '../contexts/CurrencyContext';

ChartJS.register( CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend );

const AUTO_COLOR_PALETTE = [
  '#4CAF50', '#2196F3', '#FFC107', '#F44336', '#9C27B0',
  '#00BCD4', '#FF9800', '#795548', '#E91E63', '#03A9F4',
  '#8BC34A', '#FF5722', '#607D8B', '#009688', '#CDDC39'
];

const knownColors = {
    'food': '#8b5cf6',
    'activities': '#3b82f6',
    'transport': '#facc15',
    'entertainment': '#22c55e',
    'household expenses': '#ef4444',
    'automobile': '#f97316',
    'renting a home': '#0ea5e9',
    'cosmetics': '#ec4899',
    'hobby': '#14b8a6', 'хобби': '#14b8a6', // Учитываем разные написания
    'игры': '#FF6384', 'games': '#FF6384',
};
const defaultColor = '#B0BEC5';

function ReportPage() {
    const { formatCurrency } = useCurrency();
    const assignedCategoryColors = useRef(new Map());

    const getColorForCategory = useCallback((category) => {
        const originalCategoryName = category || 'Uncategorized';
        const normalizedCategoryName = originalCategoryName.toLowerCase().trim();

        if (assignedCategoryColors.current.has(normalizedCategoryName)) {
            return assignedCategoryColors.current.get(normalizedCategoryName);
        }

        if (knownColors[normalizedCategoryName]) {
            const color = knownColors[normalizedCategoryName];
            assignedCategoryColors.current.set(normalizedCategoryName, color);
            return color;
        }
        if (knownColors[originalCategoryName]) {
            const color = knownColors[originalCategoryName];
            assignedCategoryColors.current.set(normalizedCategoryName, color);
            return color;
        }

        let hash = 0;
        for (let i = 0; i < normalizedCategoryName.length; i++) {
            hash = normalizedCategoryName.charCodeAt(i) + ((hash << 5) - hash);
            hash = hash & hash;
        }
        const assignedPaletteColorsCount = Array.from(assignedCategoryColors.current.values())
            .filter(color => AUTO_COLOR_PALETTE.includes(color)).length;
        const paletteIndex = (Math.abs(hash) + assignedPaletteColorsCount) % AUTO_COLOR_PALETTE.length;
        const color = AUTO_COLOR_PALETTE[paletteIndex];

        assignedCategoryColors.current.set(normalizedCategoryName, color);
        return color;
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
        const formatDateISO = (date) => date.toISOString().split('T')[0];
        setStartDate(formatDateISO(firstDay));
        setEndDate(formatDateISO(lastDay));
    }, []);

    const fetchTransactionsForPeriod = useCallback(async () => {
        if (!startDate || !endDate) return;
        setIsLoading(true); setError(null); setTransactions([]);
        try {
            const response = await apiClient.get('/transactions', { params: { startDate, endDate, limit: 1000, type: 'expense' } });
            if (response.data?.success && Array.isArray(response.data.transactions)) {
                setTransactions(response.data.transactions);
            } else { throw new Error('Invalid data received for transactions'); }
        } catch (err) {
            console.error("Failed to fetch transactions for report:", err);
            setError(err.response?.data?.message || err.message || 'Не удалось загрузить транзакции для отчета.');
        } finally {
            setIsLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchTransactionsForPeriod();
    }, [fetchTransactionsForPeriod]);

    const chartData = useMemo(() => {
        const expenses = transactions.filter(tx => tx.type === 'expense');
        if (expenses.length === 0) return { labels: [], datasets: [] };
        const datesInRange = []; let currentDateIter = new Date(startDate); const lastDateObj = new Date(endDate);
        while (currentDateIter <= lastDateObj) { datesInRange.push(new Date(currentDateIter)); currentDateIter.setDate(currentDateIter.getDate() + 1); }
        const labels = datesInRange.map(date => date.toLocaleDateString('ru-RU', { day: 'numeric' }));
        const dateKeys = datesInRange.map(date => date.toISOString().split('T')[0]);
        const uniqueCategories = [...new Set(expenses.map(tx => tx.category || 'Uncategorized'))];
        const dailyCategoryExpenses = {};
        dateKeys.forEach(dateKey => { dailyCategoryExpenses[dateKey] = {}; uniqueCategories.forEach(cat => { dailyCategoryExpenses[dateKey][cat] = 0; }); });
        expenses.forEach(tx => { const dateKey = new Date(tx.date).toISOString().split('T')[0]; const category = tx.category || 'Uncategorized'; if (dateKey in dailyCategoryExpenses && dailyCategoryExpenses[dateKey].hasOwnProperty(category)) { dailyCategoryExpenses[dateKey][category] += parseFloat(tx.amount || 0); } });
        const datasets = uniqueCategories.map(category => ({
            label: category,
            data: dateKeys.map(dateKey => dailyCategoryExpenses[dateKey]?.[category] || 0),
            backgroundColor: getColorForCategory(category),
        }));
        return { labels, datasets };
    }, [transactions, startDate, endDate, getColorForCategory]);

    const categorySummaryData = useMemo(() => {
        const expenses = transactions.filter(tx => tx.type === 'expense');
        const totalExpenses = expenses.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
        const categoriesSummary = expenses.reduce((acc, tx) => {
            const category = tx.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = { amount: 0, color: getColorForCategory(category) };
            }
            acc[category].amount += parseFloat(tx.amount || 0);
            return acc;
        }, {});
        return Object.entries(categoriesSummary).map(([category, data]) => ({
            category,
            amount: data.amount,
            color: data.color,
            percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
        })).sort((a, b) => b.amount - a.amount);
    }, [transactions, getColorForCategory]);

    const chartOptions = useMemo(() => ({
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, title: { display: false },
            tooltip: { mode: 'index', intersect: false,
                callbacks: { label: function(context) { let label = context.dataset.label || ''; if (label) { label += ': '; } if (context.parsed.y !== null) { label += formatCurrency(context.parsed.y); } return label; } }
            }
        },
        scales: { y: { beginAtZero: true, stacked: true, ticks: { callback: function(value) { return formatCurrency(value); } } }, x: { stacked: true, grid: { display: false } } }
    }), [formatCurrency]);

    const renderFormattedAmount = (amount) => formatCurrency(amount);

    return (
        <div className="report-page-container">
            <div className="report-content-container">
                <div className="report-period-selector"> <p><strong>Report for:</strong>{' '}{startDate ? new Date(startDate + 'T00:00:00').toLocaleDateString('ru-RU') : '...'}{' '}<strong>to</strong>{' '}{endDate ? new Date(endDate + 'T00:00:00').toLocaleDateString('ru-RU') : '...'}</p> </div>
                <div className="chart-container">
                    {isLoading && <p className="loading-message">Loading chart data...</p>}
                    {!isLoading && error && <p className="error-message">{error}</p>}
                    {!isLoading && !error && ( chartData.datasets.length > 0 ? ( <div style={{ position: 'relative', height: '300px' }}> <Bar options={chartOptions} data={chartData} /> </div> ) : ( <p className="no-data-message">No expense data for chart in this period.</p> ) )}
                </div>
                <div className="category-summary-list-figma"> {/* ИЗМЕНЕН КЛАСС */}
                    {isLoading && <p className="loading-message">Loading categories...</p>}
                    {!isLoading && error && <p className="error-message">{error}</p>}
                    {!isLoading && !error && (
                        categorySummaryData.length > 0 ? (
                            categorySummaryData.map(item => (
                                <div key={item.category} className="category-summary-item-figma">
                                    <div className="category-header-figma">
                                        <span className="category-name-figma">{item.category}</span>
                                        <span className="category-amount-figma">{renderFormattedAmount(item.amount)}</span>
                                    </div>
                                    <div className="progress-bar-container-figma">
                                        <div
                                            className="progress-bar-filled-figma"
                                            style={{
                                                width: `${item.percentage}%`,
                                                backgroundColor: item.color || defaultColor
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        ) : ( !isLoading && <p className="no-data-message">No expenses recorded for this period.</p> )
                    )}
                </div>
            </div>
        </div>
    );
}
export default ReportPage;