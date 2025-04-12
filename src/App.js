// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Стили
import './styles/global.css'; // Подключаем глобальные стили

// Компоненты и Страницы
import NavigationBar from './components/NavigationBar';
import MainPage from './pages/MainPage';
import AccountPage from './pages/AccountPage';
import HistoryPage from './pages/HistoryPage';
import ReportPage from './pages/ReportPage';
import PlanPage from './pages/PlanPage';
// import BillsPage from './pages/BillsPage'; // Если есть

function App() {
    // --- СОСТОЯНИЕ ПРИЛОЖЕНИЯ ---

    // Состояние баланса
    const [currentBalance, setCurrentBalance] = useState(() => {
        const savedBalance = localStorage.getItem('currentBalance');
        // Используем 783.81 как начальное значение по умолчанию
        return savedBalance ? parseFloat(savedBalance) : 783.81;
    });

    // Состояние транзакций
    const [transactions, setTransactions] = useState(() => {
        const savedTransactions = localStorage.getItem('transactions');
        return savedTransactions ? JSON.parse(savedTransactions) : [];
    });

    // --- ЭФФЕКТЫ ДЛЯ LOCALSTORAGE ---

    // Сохраняем баланс при его изменении
    useEffect(() => {
        localStorage.setItem('currentBalance', currentBalance.toFixed(2));
    }, [currentBalance]);

    // Сохраняем транзакции при их изменении
    useEffect(() => {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }, [transactions]);

    // --- ОБРАБОТЧИКИ ДЕЙСТВИЙ ---

    // Обработчик добавления расхода (вызывается из MainPage -> ExpenseModal)
    const handleAddExpense = (expenseData) => {
        // 1. Создаем объект новой транзакции
        const newTransaction = {
            id: Date.now(), // Уникальный ID на основе времени
            type: 'expense',
            amount: expenseData.amount,
            category: expenseData.category,
            date: new Date().toISOString() // Сохраняем дату в стандартном формате
        };

        // 2. Обновляем список транзакций (добавляем новую в начало)
        setTransactions(prevTransactions => [newTransaction, ...prevTransactions]);

        // 3. Обновляем баланс (вычитаем расход)
        setCurrentBalance(prevBalance => prevBalance - expenseData.amount);
    };

    // Обработчик редактирования баланса (вызывается из MainPage)
    const handleEditBalance = () => {
        const input = prompt("Enter new total balance:", currentBalance.toFixed(2));
        if (input !== null) { // Если пользователь не нажал "Отмена"
            // Заменяем запятую на точку и преобразуем в число
            const newBalance = parseFloat(input.replace(',', '.'));
            // Проверяем, что введено корректное неотрицательное число
            if (!isNaN(newBalance) && newBalance >= 0) {
                // Опционально: можно добавить транзакцию "корректировка баланса"
                // const difference = newBalance - currentBalance;
                // if (Math.abs(difference) > 0.01) { ... }

                // Устанавливаем новый баланс
                setCurrentBalance(newBalance);
            } else {
                alert("Invalid amount entered. Please enter a non-negative number.");
            }
        }
    };

    // --- РЕНДЕР КОМПОНЕНТА ---
    return (
        <Router>
            {/* Общий контейнер, которому задан padding-bottom в global.css */}
            <div className="app-container">
                {/* Основная часть контента */}
                <main className="main-content">
                    {/* Система роутинга */}
                    <Routes>
                        {/* Главная страница */}
                        <Route
                            path="/"
                            element={
                                <MainPage
                                    // Передаем нужные данные и функции в MainPage
                                    currentBalance={currentBalance}
                                    onEditBalance={handleEditBalance} // Функция для кнопки Edit
                                    onAddExpense={handleAddExpense}   // Функция для добавления расхода
                                />
                            }
                        />
                        {/* Страница истории */}
                        <Route
                            path="/history"
                            element={
                                // Передаем список транзакций в HistoryPage
                                <HistoryPage transactions={transactions} />
                             }
                        />
                        {/* Другие страницы */}
                        <Route path="/account" element={<AccountPage />} />
                        <Route path="/report" element={<ReportPage />} />
                        <Route path="/plan" element={<PlanPage />} />
                        {/* <Route path="/bills" element={<BillsPage />} /> */}

                        {/* Можно добавить роут для страницы 404 */}
                        {/* <Route path="*" element={ <NotFoundPage /> } /> */}
                    </Routes>
                </main>

                {/* Нижняя панель навигации (отображается на всех страницах) */}
                <NavigationBar />
            </div>
        </Router>
    );
}

export default App;