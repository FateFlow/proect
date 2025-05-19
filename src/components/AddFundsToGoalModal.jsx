// src/components/AddFundsToGoalModal.jsx
import React, { useState, useEffect } from 'react';
import '../styles/expenseModal.css'; // Можно переиспользовать или создать новые стили
import { useCurrency } from '../contexts/CurrencyContext'; // Для отображения BASE_DB_CURRENCY

function AddFundsToGoalModal({ isOpen, onClose, onSave, goalName, isSaving, saveError }) {
    const { BASE_DB_CURRENCY } = useCurrency();
    const [amount, setAmount] = useState('');
    const [localError, setLocalError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setLocalError('');
            // saveError будет приходить из пропсов и сбрасываться в PlanPage
        }
    }, [isOpen]);

    const handleSave = () => {
        setLocalError('');
        const numericAmount = parseFloat(amount); // amount - это то, что введено в input
        if (!amount.trim() || isNaN(numericAmount) || numericAmount <= 0) {
            setLocalError(`Please enter a valid positive amount in ${BASE_DB_CURRENCY}.`);
            return;
        }
        console.log('AddFundsToGoalModal: Saving amount:', numericAmount); // <--- ДОБАВЬ ЭТОТ ЛОГ
        onSave(numericAmount); // Передаем только число
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content-new" onClick={(e) => e.stopPropagation()} style={{ minWidth: '300px' }}> {/* Можно задать ширину */}
                <h4 className="category-title" style={{ marginBottom: '10px' }}>
                    Add funds to: <br />
                    <span style={{ fontWeight: 'bold', display: 'inline-block', marginTop: '5px' }}>{goalName}</span>
                </h4>
                <label htmlFor="fundAmount" style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>
                    Amount to add (in {BASE_DB_CURRENCY}):
                </label>
                <input
                    id="fundAmount"
                    type="number"
                    className="amount-input" // Используем существующий класс или создаем новый
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isSaving}
                    autoFocus
                    step="0.01"
                    inputMode="decimal"
                />

                {(localError || saveError) && (
                    <p className="error-message-new" style={{ marginTop: '10px' }}>
                        {localError || saveError}
                    </p>
                )}

                <button
                    className="done-btn-new" // Используем существующий класс или создаем новый
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{ marginTop: '15px' }}
                >
                    {isSaving ? 'Adding...' : 'Add Funds'}
                </button>
            </div>
        </div>
    );
}

export default AddFundsToGoalModal;