// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import NavigationBar from './components/NavigationBar';
import MainPage from './pages/MainPage';
import AccountPage from './pages/AccountPage';
import HistoryPage from './pages/HistoryPage';
import ReportPage from './pages/ReportPage';
import PlanPage from './pages/PlanPage';
import BillsPage from './pages/BillsPage';
import AuthPage from './pages/AuthPage.jsx';
// import BillsPage from './pages/BillsPage';

function App() {
    const [currentBalance, setCurrentBalance] = useState(() => {
        const savedBalance = localStorage.getItem('currentBalance');
        return savedBalance ? parseFloat(savedBalance) : 783.81;
    });
    const [transactions, setTransactions] = useState(() => {
        const savedTransactions = localStorage.getItem('transactions');
        return savedTransactions ? JSON.parse(savedTransactions) : [];
    });

    // Состояние для модального окна добавления баланса
    const [isAddBalanceModalOpen, setIsAddBalanceModalOpen] = useState(false);

    // Сохранение в localStorage
    useEffect(() => { localStorage.setItem('currentBalance', currentBalance.toFixed(2)); }, [currentBalance]);
    useEffect(() => { localStorage.setItem('transactions', JSON.stringify(transactions)); }, [transactions]);

    // Добавление расхода
    const handleAddExpense = (expenseData) => {
        const newTransaction = { id: Date.now(), type: 'expense', amount: expenseData.amount, category: expenseData.category, date: new Date().toISOString() };
        setTransactions(prevTransactions => [newTransaction, ...prevTransactions]);
        setCurrentBalance(prevBalance => prevBalance - expenseData.amount);
    };

    // Открытие модалки добавления баланса
    const handleOpenAddBalanceModal = () => {
        setIsAddBalanceModalOpen(true);
    };
    // Закрытие модалки добавления баланса
    const handleCloseAddBalanceModal = () => {
        setIsAddBalanceModalOpen(false);
    };

    // Добавление суммы к балансу
    const handleAddAmountToBalance = (amountToAdd) => {
        setCurrentBalance(prevBalance => prevBalance + amountToAdd);
        // Опционально: добавить транзакцию 'income'
        const adjustmentTransaction = { id: Date.now(), type: 'income', amount: amountToAdd, category: 'Balance Top-up', date: new Date().toISOString() };
        setTransactions(prev => [adjustmentTransaction, ...prev]);
        handleCloseAddBalanceModal(); // Закрываем модалку
    };

    return (
        <Router>
            <div className="app-container">
                <main className="main-content">
                    <Routes>
                        <Route
                            path="/"
                            element={<MainPage
                                        currentBalance={currentBalance}
                                        onEditBalance={handleOpenAddBalanceModal} // Передаем функцию ОТКРЫТИЯ
                                        onAddExpense={handleAddExpense}
                                        // Пропсы для новой модалки
                                        isAddBalanceModalOpen={isAddBalanceModalOpen}
                                        onCloseAddBalanceModal={handleCloseAddBalanceModal}
                                        onAddAmountToBalance={handleAddAmountToBalance}
                                     />}
                        />
                        <Route
                            path="/report"
                            element={<ReportPage transactions={transactions} />} // <<< ПЕРЕДАЕМ ПРОПС
                        />
                        <Route path="/account" element={<AccountPage />} />
                        <Route path="/report" element={<ReportPage />} />
                        <Route path="/plan" element={<PlanPage />} />
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/bills" element={<BillsPage />} />
                        <Route path="/history" element={<HistoryPage transactions={transactions} />} />
                        {/* <Route path="/bills" element={<BillsPage />} /> */}
                    </Routes>
                </main>
                <NavigationBar />
            </div>
        </Router>
    );
}

export default App;