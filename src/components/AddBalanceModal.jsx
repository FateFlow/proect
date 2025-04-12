// src/components/AddBalanceModal.jsx
import React, { useState, useEffect } from 'react';
// Используем стили expenseModal, т.к. дизайн похож
import '../styles/expenseModal.css';

function AddBalanceModal({ isOpen, onClose, onAddAmount }) {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    // Сброс состояния при открытии
    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setError('');
            setTimeout(() => document.getElementById('addBalanceAmountInput')?.focus(), 100);
        }
    }, [isOpen]);

    const handleAddClick = () => {
        const numericAmount = parseFloat(amount.replace(',', '.'));
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError('Please enter a valid positive amount to add.');
            return;
        }
        setError('');
        onAddAmount(numericAmount); // Вызываем колбэк с суммой для добавления
    };

    if (!isOpen) {
        return null;
    }

    return (
        // Используем существующий оверлей
        <div className="modal-overlay" onClick={onClose}>
            {/* Используем .modal-content-new для схожего вида */}
            <div className="modal-content-new" onClick={(e) => e.stopPropagation()}>

                {/* Заголовок */}
                {/* Используем .category-title для схожего вида заголовка */}
                <h3 className="category-title" style={{ textAlign: 'center', marginBottom: '25px' }}>Add to Balance</h3>

                {/* Поле ввода суммы */}
                <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    id="addBalanceAmountInput"
                    className="amount-input" // Используем тот же стиль инпута
                    placeholder="Enter amount to add"
                    value={amount}
                    onChange={(e) => {
                        setAmount(e.target.value);
                        if (error) setError('');
                    }}
                />

                {/* Сообщение об ошибке */}
                {error && <p className="error-message-new" style={{ marginTop: '-10px' }}>{error}</p>}

                {/* Кнопка "Add" */}
                {/* Используем .done-btn-new для схожего вида кнопки */}
                <button className="done-btn-new" onClick={handleAddClick} style={{ marginTop: '25px' }}>
                    Add Amount
                </button>
            </div>
        </div>
    );
}

export default AddBalanceModal;