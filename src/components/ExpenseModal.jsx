// src/components/ExpenseModal.jsx
import React, { useState, useEffect } from 'react';
import '../styles/expenseModal.css';

// Добавляем isSaving и saveError в пропсы
function ExpenseModal({ isOpen, onClose, onSave, isSaving, saveError }) {
    const [amount, setAmount] = useState('');
    const [categoryInput, setCategoryInput] = useState('');
    // Убираем локальную ошибку, будем использовать saveError из пропсов
    // const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setCategoryInput('');
            // Локальную ошибку больше не сбрасываем
            // setError('');
        }
    }, [isOpen]);

    const handleSave = () => {
        // Локальная валидация (оставляем, чтобы не отправлять заведомо неверные данные)
        if (!amount.trim() || !categoryInput.trim()) {
           // Можно показать локальную ошибку или просто не вызывать onSave
           console.warn("Amount or category is empty");
           // Или установить локальную ошибку, если нужно ее показать
           // setLocalError('Please enter both amount and category.');
           return;
        }
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            console.warn("Invalid amount");
            // setLocalError('Please enter a valid positive amount.');
            return;
        }

        const expenseData = {
            amount: numericAmount,
            category: categoryInput.trim(),
            date: new Date().toISOString(),
            // Добавляем notes, если нужно поле для заметок
            notes: '', // Или добавить поле ввода для notes
        };

        // Вызываем onSave (который теперь handleSaveExpenseSubmit в MainPage)
        onSave(expenseData);
        // Закрытие модалки происходит в MainPage после успешного сохранения
    };

    if (!isOpen) { return null; }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content-new" onClick={(e) => e.stopPropagation()}>
                <input
                    type="number"
                    className="amount-input"
                    placeholder="Enter the amount of money"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isSaving} // Блокируем ввод во время сохранения
                    autoFocus
                />
                <h4 className="category-title">Category</h4>
                <input
                    type="text"
                    className="amount-input"
                    placeholder="Enter category name"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    disabled={isSaving} // Блокируем ввод во время сохранения
                />

                 {/* Отображение ОШИБКИ СОХРАНЕНИЯ (из пропсов) */}
                {saveError && <p className="error-message-new">{saveError}</p>}

                {/* Можно добавить локальную ошибку валидации, если нужно */}
                {/* {localError && <p className="error-message-new">{localError}</p>} */}

                 {/* Кнопка "Done" показывает статус сохранения */}
                <button
                    className="done-btn-new"
                    onClick={handleSave}
                    disabled={isSaving} // Блокируем кнопку во время сохранения
                >
                    {isSaving ? 'Saving...' : 'Done'}
                </button>
            </div>
        </div>
    );
}

export default ExpenseModal;