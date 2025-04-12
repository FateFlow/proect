// src/components/ExpenseModal.jsx
import React, { useState, useEffect } from 'react';
import '../styles/expenseModal.css'; // Убедись, что стили импортированы

function ExpenseModal({ isOpen, onClose, onSave }) {
    const [amount, setAmount] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [error, setError] = useState(''); // Для сообщений об ошибках

    // Список категорий (как на макете фото 5)
    const categories = ["Automobile", "Renting a home", "Cosmetics", "Household chemicals", "Hobby"];

    // Сброс состояния при открытии
    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setSelectedCategory(null);
            setError('');
            // Фокус на поле ввода суммы
            setTimeout(() => document.getElementById('expenseAmountInput')?.focus(), 100);
        }
    }, [isOpen]);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        if (error) setError(''); // Сбросить ошибку при выборе
    };

    const handleSaveClick = () => {
        const numericAmount = parseFloat(amount.replace(',', '.'));
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        if (!selectedCategory) {
            setError('Please select a category.');
            return;
        }
        setError('');
        // Вызываем функцию onSave, переданную из MainPage
        onSave({ amount: numericAmount, category: selectedCategory });
        // Закрытие окна происходит в MainPage после вызова onSave
    };

    // Не рендерим ничего, если окно не открыто (управляется в MainPage)
    if (!isOpen) {
        return null;
    }

    return (
        // Оверлей (фон)
        <div className="modal-overlay" onClick={onClose}>
            {/* Контент модального окна */}
            <div className="modal-content-new" onClick={(e) => e.stopPropagation()}>

                {/* Поле ввода суммы */}
                <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    id="expenseAmountInput"
                    className="amount-input" // Используем класс из expenseModal.css
                    placeholder="Enter the amount of money"
                    value={amount}
                    onChange={(e) => {
                        setAmount(e.target.value);
                        if (error) setError('');
                    }}
                />

                {/* Заголовок "Category" */}
                <h3 className="category-title">Category</h3>

                {/* Кнопка "+ Add category" (пока неактивна) */}
                {/* <button className="add-category-btn">+ Add category</button> */}

                {/* Список категорий */}
                <div className="category-list-new">
                    {categories.map(category => (
                        <button
                            key={category}
                            // Используем классы из expenseModal.css
                            className={`category-item-new ${selectedCategory === category ? 'selected' : ''}`}
                            onClick={() => handleCategoryClick(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                 {/* Отображение ошибки */}
                 {error && <p className="error-message-new">{error}</p>}

                {/* Кнопка "Done" */}
                 {/* Используем класс из expenseModal.css */}
                <button className="done-btn-new" onClick={handleSaveClick}>
                    Done
                </button>
            </div>
        </div>
    );
}

export default ExpenseModal;