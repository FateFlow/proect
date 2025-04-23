// src/pages/MainPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import '../styles/mainPage.css';
import { formatCurrency } from '../utils/formatting';
// --- ИМПОРТЫ МОДАЛЬНЫХ ОКОН ---
import ExpenseModal from '../components/ExpenseModal.jsx'; // Для трат
import AddBalanceModal from '../components/AddBalanceModal.jsx'; // Для баланса

// --- ОПРЕДЕЛЕНИЯ ИКОНОК ---
const BillsIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="28" height="28"> <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm7.878 1.621a.5.5 0 0 0-.378-.121h-1v3.5A1.5 1.5 0 0 1 9.5 8.5h-3A1.5 1.5 0 0 1 5 7V3.379a.5.5 0 0 0-.121.378v12.243a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V7.879a.5.5 0 0 0-.121-.378L12.378 3.62Z" clipRule="evenodd" /> <path d="M6.5 9.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5Zm0 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5Zm0 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5Z" /> </svg> );
const HistoryIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="28" height="28"> <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" /> </svg> );
// --- КОНЕЦ ОПРЕДЕЛЕНИЙ ИКОНОК ---


function MainPage() {
    // Состояния для баланса, загрузки дашборда и ошибки
    const [balance, setBalance] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Состояния для модалки добавления ТРАТЫ
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isSavingExpense, setIsSavingExpense] = useState(false);
    const [saveExpenseError, setSaveExpenseError] = useState(null);

    // === ДОБАВЛЕНО: Состояния для модалки БАЛАНСА ===
    const [isAddBalanceModalOpen, setIsAddBalanceModalOpen] = useState(false);
    const [isAddingBalance, setIsAddingBalance] = useState(false);
    const [addBalanceError, setAddBalanceError] = useState(null);
    // ===============================================

    const navigate = useNavigate();

    // Функция загрузки данных дашборда (баланса)
    const fetchDashboardData = useCallback(async () => {
        if (balance === null && !error) setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/dashboard');
            if (response.data && typeof response.data.balance !== 'undefined') {
                setBalance(parseFloat(response.data.balance));
                console.log('Dashboard data loaded/refreshed:', response.data.balance);
            } else { throw new Error('Invalid data received from server (missing balance)'); }
        } catch (err) { console.error("Failed to fetch dashboard data:", err); setError(err.response?.data?.message || err.message || 'Не удалось загрузить баланс.'); if (balance === null) setBalance(0);
        } finally { setIsLoading(false); }
    }, [balance, error]);

    useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

    // Обработчики модалки ТРАТ (без изменений)
    const handleOpenExpenseModal = () => { setSaveExpenseError(null); setIsExpenseModalOpen(true); }
    const handleCloseExpenseModal = () => setIsExpenseModalOpen(false);
    const handleSaveExpenseSubmit = async (expenseData) => {
        setIsSavingExpense(true); setSaveExpenseError(null);
        try {
            const transactionData = { ...expenseData, type: 'expense' };
            await apiClient.post('/transactions', transactionData);
            handleCloseExpenseModal();
            fetchDashboardData();
        } catch (err) { console.error("Failed to save expense:", err); setSaveExpenseError(err.response?.data?.message || err.message || 'Не удалось сохранить трату.');
        } finally { setIsSavingExpense(false); }
    };

    // === ДОБАВЛЕНО: Обработчики модалки БАЛАНСА ===
    const handleOpenAddBalanceModal = () => {
        setAddBalanceError(null);
        setIsAddBalanceModalOpen(true);
    }
    const handleCloseAddBalanceModal = () => setIsAddBalanceModalOpen(false);

    const handleAddBalanceSubmit = async (amountToAdd) => {
        const numericAmount = parseFloat(amountToAdd);
        if (isNaN(numericAmount) || numericAmount <= 0) { setAddBalanceError('Please enter a valid positive amount.'); return; }
        setIsAddingBalance(true); setAddBalanceError(null);
        try {
            const transactionData = { type: 'income', amount: numericAmount, category: 'Balance Top-up', date: new Date().toISOString(), notes: 'User balance adjustment' };
            await apiClient.post('/transactions', transactionData);
            handleCloseAddBalanceModal();
            fetchDashboardData();
        } catch (err) { console.error("Failed to add balance:", err); setAddBalanceError(err.response?.data?.message || err.message || 'Не удалось обновить баланс.');
        } finally { setIsAddingBalance(false); }
    };
    // =============================================


    // Функция рендера баланса (читает валюту из localStorage)
    const renderBalance = () => {
        if (isLoading && balance === null) { return <span>Loading...</span>; }
        if (error) { return ( <> <span style={{color: 'red', fontSize: '0.8em', display: 'block', marginBottom: '5px'}}>{error}</span> {formatCurrency(0)} </> ); } // Форматируем 0
        // Просто передаем баланс в хелпер
        return formatCurrency(balance);
    };

    return (
        // Основной контейнер
        <div className="main-page-container">

            {/* --- Секция баланса --- */}
            <section className="balance-section">
                {/* --- ВОССТАНОВЛЕНО: Текст "Available balance" --- */}
                <span>Available balance</span>
                {/* Отображение баланса */}
                <h1>{renderBalance()}</h1>
                 {/* --- ИЗМЕНЕНО: Кнопка Edit теперь рабочая --- */}
                 <button
                    className="edit-balance-btn"
                    onClick={handleOpenAddBalanceModal} // Вызывает открытие модалки баланса
                    disabled={isLoading} // Блокируем, пока грузится баланс
                 > Edit </button>
            </section>

            {/* --- Секция кнопок действий --- */}
            <section className="action-buttons">
                 {/* --- ВОССТАНОВЛЕНЫ: Кнопки с иконками --- */}
                 <button className="action-btn" onClick={() => navigate('/bills')}> <BillsIcon /> <span>Bills</span> </button>
                 <button className="action-btn add-spending-btn" onClick={handleOpenExpenseModal} disabled={isLoading} > <div className="plus-icon">+</div> <span>Add spending</span> </button>
                 <button className="action-btn" onClick={() => navigate('/history')}> <HistoryIcon /> <span>History</span> </button>
            </section>

            {/* --- Контейнер для контента --- */}
            <div className="content-container">
                 {/* --- ВОССТАНОВЛЕНО: Карточка Savings с текстом --- */}
                 <section className="savings-card">
                     <div className="savings-card-content">
                         <h2>Savings</h2>
                         <p className="savings-intro-text"> Easily and conveniently manage your finances! </p>
                         <p className="savings-detail-text"> Track your expenses, plan your budget, and achieve your financial goals — all in one place. Simplicity, clarity, and full control over your money. </p>
                     </div>
                 </section>
            </div>

            {/* --- Рендер модальных окон --- */}
            {/* Модалка трат */}
            {isExpenseModalOpen && ( <ExpenseModal isOpen={isExpenseModalOpen} onClose={handleCloseExpenseModal} onSave={handleSaveExpenseSubmit} isSaving={isSavingExpense} saveError={saveExpenseError} /> )}
            {/* === ДОБАВЛЕНО: Рендер модалки баланса === */}
            {isAddBalanceModalOpen && ( <AddBalanceModal isOpen={isAddBalanceModalOpen} onClose={handleCloseAddBalanceModal} onAddAmount={handleAddBalanceSubmit} isAdding={isAddingBalance} addError={addBalanceError} /> )}
            {/* ===================================== */}
        </div>
    );
}

export default MainPage;