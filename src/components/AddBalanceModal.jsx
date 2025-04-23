// src/components/AddBalanceModal.jsx
import React, { useState, useEffect } from 'react';
import '../styles/expenseModal.css'; // Используем стили expenseModal

// --- ДОБАВЛЯЕМ isAdding и addError в пропсы ---
function AddBalanceModal({ isOpen, onClose, onAddAmount, isAdding, addError }) {
    const [amount, setAmount] = useState('');
    // Убираем локальное состояние ошибки, будем использовать addError из пропсов
    // const [error, setError] = useState('');
    // Добавим локальную ошибку только для ВАЛИДАЦИИ ввода
    const [validationError, setValidationError] = useState('');


    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setValidationError(''); // Сбрасываем ошибку валидации
            // Ошибку сервера (addError) не сбрасываем здесь, она придет извне
            setTimeout(() => document.getElementById('addBalanceAmountInput')?.focus(), 100);
        }
    }, [isOpen]);

    const handleAddClick = () => {
        // Валидация ввода
        const numericAmount = parseFloat(amount.replace(',', '.'));
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setValidationError('Please enter a valid positive amount to add.'); // Устанавливаем ошибку валидации
            return;
        }
        setValidationError(''); // Сбрасываем ошибку валидации, если все ок

        // Вызываем колбэк из MainPage, передавая число
        onAddAmount(numericAmount);
    };

    if (!isOpen) { return null; }

    return (
        <div className="modal-overlay" onClick={isAdding ? undefined : onClose}> {/* Не закрывать при клике во время загрузки */}
            <div className="modal-content-new" onClick={(e) => e.stopPropagation()}>
                <h3 className="category-title" style={{ textAlign: 'center', marginBottom: '25px' }}>Add to Balance</h3>
                <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    id="addBalanceAmountInput"
                    className="amount-input"
                    placeholder="Enter amount to add"
                    value={amount}
                    onChange={(e) => {
                        setAmount(e.target.value);
                        // Сбрасываем ошибку валидации при изменении ввода
                        if (validationError) setValidationError('');
                    }}
                    // --- Блокируем поле во время отправки ---
                    disabled={isAdding}
                />

                {/* --- Отображаем ошибку ВАЛИДАЦИИ --- */}
                {validationError && <p className="error-message-new" style={{ marginTop: '-10px' }}>{validationError}</p>}
                {/* --- Отображаем ошибку СЕРВЕРА (из пропсов) --- */}
                {!validationError && addError && <p className="error-message-new" style={{ marginTop: '-10px' }}>{addError}</p>}

                {/* Кнопка "Add Amount" */}
                <button
                    className="done-btn-new"
                    onClick={handleAddClick}
                    style={{ marginTop: '25px' }}
                    // --- Блокируем кнопку и меняем текст во время отправки ---
                    disabled={isAdding}
                >
                    {isAdding ? 'Adding...' : 'Add Amount'}
                </button>
            </div>
        </div>
    );
}

export default AddBalanceModal;