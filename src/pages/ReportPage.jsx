// src/pages/ReportPage.jsx
import React, { useMemo } from 'react';
// --- ИСПРАВЛЕНИЕ: Все импорты В САМОМ ВЕРХУ ---
import '../styles/reportPage.css'; // Сначала стили
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { BsGraphDownArrow, BsGraphUpArrow } from "react-icons/bs";

// Регистрируем компоненты ChartJS
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// --- Компонент ReportPage ---
function ReportPage({ transactions = [] }) {

    // --- Вспомогательные функции и данные ТЕПЕРЬ ВНУТРИ КОМПОНЕНТА ---

    // Кэш для цветов категорий (будет сбрасываться при каждом рендере, но для примера сойдет)
    // Для стабильности цветов лучше вынести или использовать useMemo/useRef
    const categoryColorsRef = React.useRef({});

    const knownColors = useMemo(() => ({ // Используем useMemo для стабильности объекта
        'Food': '#8b5cf6',
        'Activities': '#3b82f6',
        'Transport': '#facc15',
        'Entertainment': '#22c55e',
        'Household expenses': '#ef4444',
        'Automobile': '#f97316',
        'Renting a home': '#0ea5e9',
        'Cosmetics': '#ec4899',
        'Hobby': '#14b8a6',
    }), []); // Пустой массив зависимостей - создается один раз

    const defaultColor = '#cccccc';

    const getColorForCategory = React.useCallback((category) => {
        if (knownColors[category]) return knownColors[category];
        if (categoryColorsRef.current[category]) return categoryColorsRef.current[category];

        let hash = 0;
        for (let i = 0; i < category.length; i++) {
            hash = category.charCodeAt(i) + ((hash << 5) - hash);
            hash = hash & hash;
        }
        const color = `hsl(${hash % 360}, 60%, 70%)`;
        categoryColorsRef.current[category] = color; // Сохраняем в ref
        return color || defaultColor;
    }, [knownColors]); // Зависимость от knownColors

    // --- Подготовка данных для графика ---
    const chartData = useMemo(() => {
        // Функция теперь внутри useMemo, чтобы иметь доступ к getColorForCategory
        const prepare = (trans, days = 30) => {
            const expenses = trans.filter(tx => tx.type === 'expense');
            if (expenses.length === 0) return { labels: [], datasets: [] };

            const dailyCategoryExpenses = {};
            const labels = [];
            const dateKeys = [];
            const categories = [...new Set(expenses.map(tx => tx.category || 'Uncategorized'))];
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (let i = days - 1; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const label = date.toLocaleDateString('en-US', { day: 'numeric' });
                const dateKey = date.toISOString().split('T')[0];
                labels.push(label);
                dateKeys.push(dateKey);
                dailyCategoryExpenses[dateKey] = {};
                categories.forEach(cat => { dailyCategoryExpenses[dateKey][cat] = 0; });
            }

            expenses.forEach(tx => {
                const txDate = new Date(tx.date);
                txDate.setHours(0, 0, 0, 0);
                const dateKey = txDate.toISOString().split('T')[0];
                const category = tx.category || 'Uncategorized';
                if (dateKey in dailyCategoryExpenses) {
                    if (!dailyCategoryExpenses[dateKey][category]) {
                        dailyCategoryExpenses[dateKey][category] = 0;
                    }
                    dailyCategoryExpenses[dateKey][category] += tx.amount;
                }
            });

            const datasets = categories.map(category => {
                const data = dateKeys.map(dateKey => dailyCategoryExpenses[dateKey]?.[category] || 0); // Добавлена проверка на существование dateKey
                return {
                    label: category,
                    data: data,
                    backgroundColor: getColorForCategory(category), // Вызываем внутреннюю getColorForCategory
                };
            });
            // ИСПРАВЛЕНИЕ: 'labels' и 'datasets' определены ЗДЕСЬ, перед return
            return { labels, datasets };
        };
        // Вызываем функцию prepare внутри useMemo
        return prepare(transactions);

    }, [transactions, getColorForCategory]); // Добавляем getColorForCategory в зависимости useMemo

    // --- Подготовка данных для списка категорий ---
    const categoryData = useMemo(() => {
        // Функция теперь внутри useMemo
        const prepare = (trans) => {
            const expenses = trans.filter(tx => tx.type === 'expense');
            const totalExpenses = expenses.reduce((sum, tx) => sum + tx.amount, 0);

            const categoriesSummary = expenses.reduce((acc, tx) => {
                const category = tx.category || 'Uncategorized';
                if (!acc[category]) {
                    acc[category] = { amount: 0, color: getColorForCategory(category) };
                }
                acc[category].amount += tx.amount;
                return acc;
            }, {});

            return Object.entries(categoriesSummary)
                .map(([category, data]) => ({
                    category,
                    amount: data.amount,
                    color: data.color,
                    percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
                }))
                .sort((a, b) => b.amount - a.amount);
        };
        // Вызываем функцию prepare внутри useMemo
        return prepare(transactions);

    }, [transactions, getColorForCategory]); // Добавляем getColorForCategory в зависимости useMemo

    // --- Опции для графика (остаются как были) ---
    const chartOptions = useMemo(() => ({ // Оборачиваем в useMemo для стабильности
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) { label += ': '; }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BYN' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                stacked: true,
                ticks: { callback: function(value) { return value + 'BYN'; } }
            },
            x: {
                stacked: true,
                grid: { display: false }
            }
        }
    }), []); // Пустой массив зависимостей - опции не меняются

    // --- JSX разметка ---
    return (
        <div className="report-page-container">
            <div className="report-content-container">
                <div className="report-section-header">
                    <button className="report-type-btn active"> <BsGraphDownArrow /> </button>
                    <button className="report-type-btn"> <BsGraphUpArrow /> </button>
                </div>

                <div className="chart-container">
                    {chartData.datasets.length > 0 ? (
                        <Bar options={chartOptions} data={chartData} />
                    ) : (
                        <p className="no-data-message">No expense data for chart</p>
                    )}
                </div>

                <div className="category-summary-list">
                    {categoryData.length > 0 ? (
                        categoryData.map(item => (
                            <div key={item.category} className="category-summary-item">
                                <div className="category-info">
                                    <span className="category-name">{item.category}</span>
                                    <span className="category-amount">{item.amount.toFixed(2)}BYN</span>
                                </div>
                                <div className="category-progress-bar-bg">
                                    <div
                                        className="category-progress-bar-fg"
                                        style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                                    ></div>
                                </div>
                            </div>
                        ))
                    ) : (
                         <p className="no-data-message">No expenses recorded yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ReportPage;