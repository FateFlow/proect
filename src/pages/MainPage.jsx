// src/pages/MainPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/mainPage.css'; // Импорт стилей
import ExpenseModal from '../components/ExpenseModal.jsx';
import AddBalanceModal from '../components/AddBalanceModal.jsx';

// --- Иконки Bills и History ---
const BillsIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="28" height="28"> <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm7.878 1.621a.5.5 0 0 0-.378-.121h-1v3.5A1.5 1.5 0 0 1 9.5 8.5h-3A1.5 1.5 0 0 1 5 7V3.379a.5.5 0 0 0-.121.378v12.243a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V7.879a.5.5 0 0 0-.121-.378L12.378 3.62Z" clipRule="evenodd" /> <path d="M6.5 9.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5Zm0 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5Zm0 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5Z" /> </svg> );
const HistoryIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="28" height="28"> <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" /> </svg> );

// --- Принимаем пропсы ---
function MainPage({
    currentBalance,
    onEditBalance, // Открывает AddBalanceModal
    onAddExpense,
    isAddBalanceModalOpen,
    onCloseAddBalanceModal,
    onAddAmountToBalance
}) {
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleOpenExpenseModal = () => setIsExpenseModalOpen(true);
    const handleCloseExpenseModal = () => setIsExpenseModalOpen(false);

    const handleSaveExpense = (expenseData) => {
        onAddExpense(expenseData);
        handleCloseExpenseModal();
    };

    return (
        // --- Добавляем position: relative сюда ---
        <div className="main-page-container">

            {/* --- Секция баланса --- */}
            <section className="balance-section">
                <span>Available balance</span>
                <h1>BYN {currentBalance.toFixed(2)}</h1>
                <button className="edit-balance-btn" onClick={onEditBalance}> Edit </button>
            </section>

            {/* --- ВАЖНО: Секция кнопок теперь ЗДЕСЬ, перед content-container --- */}
            <section className="action-buttons">
                <button className="action-btn" onClick={() => navigate('/bills')}> <BillsIcon /> <span>Bills</span> </button>
                <button className="action-btn add-spending-btn" onClick={handleOpenExpenseModal}> <div className="plus-icon">+</div> <span>Add spending</span> </button>
                <button className="action-btn" onClick={() => navigate('/history')}> <HistoryIcon /> <span>History</span> </button>
            </section>

            {/* --- Контейнер для остального контента (Savings и т.д.) --- */}
            <div className="content-container">

                {/* Карточка Savings теперь первый элемент внутри этого контейнера */}
<section className="savings-card">
    {/* Добавляем контейнер для текста поверх фона */}
    <div className="savings-card-content">
        <h2>Savings</h2>
        <p className="savings-intro-text">
            Easily and conveniently manage your finances!
        </p>
        <p className="savings-detail-text">
            Track your expenses, plan your budget, and achieve your financial goals — all in one place. Simplicity, clarity, and full control over your money.
        </p>
    </div>
</section>
{/* --- КОНЕЦ: ОБНОВЛЕННАЯ КАРТОЧКА SAVINGS --- */}

                {/* Сюда можно добавлять другие карточки или секции */}

            </div> {/* Конец content-container */}

            {/* Модальные окна остаются в конце */}
            {isExpenseModalOpen && (
                <ExpenseModal
                    isOpen={isExpenseModalOpen}
                    onClose={handleCloseExpenseModal}
                    onSave={handleSaveExpense}
                />
            )}
            {isAddBalanceModalOpen && (
                <AddBalanceModal
                    isOpen={isAddBalanceModalOpen}
                    onClose={onCloseAddBalanceModal}
                    onAddAmount={onAddAmountToBalance}
                />
            )}
                        {/* --- ДОБАВИТЬ ЭТОТ БЛОК --- */}
            {/* Компенсация высоты нижней навигации */}
            <div style={{ height: '69px' }}></div> {/* <-- УКАЖИ ТОЧНУЮ ВЫСОТУ НАВИГАЦИИ */}
            {/* --- КОНЕЦ БЛОКА --- */}
        </div> // Конец main-page-container
    );
}

export default MainPage;