// src/components/ExpenseModal.jsx
import React, { useState, useEffect } from 'react';
import '../styles/expenseModal.css'; // Импортируем стили модалки

// Принимаем пропсы от MainPage
function ExpenseModal({ isOpen, onClose, onSave }) {
    // Состояние для суммы
    const [amount, setAmount] = useState('');
    // НОВОЕ: Состояние для ввода категории текстом
    const [categoryInput, setCategoryInput] = useState('');
    // Состояние для ошибки валидации
    const [error, setError] = useState('');

    // Эффект для сброса полей при каждом открытии модалки
    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setCategoryInput('');
            setError('');
        }
    }, [isOpen]); // Зависимость от isOpen

    // Обработчик нажатия кнопки "Done"
    const handleSave = () => {
        setError(''); // Сброс предыдущей ошибки

        // Валидация
        if (!amount.trim() || !categoryInput.trim()) {
            setError('Please enter both amount and category.');
            return;
        }
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError('Please enter a valid positive amount.');
            return;
        }

        // Формируем объект данных для передачи в MainPage (через onSave)
        const expenseData = {
            amount: numericAmount,
            category: categoryInput.trim(), // Используем введенную категорию
            date: new Date().toISOString(), // Добавляем текущую дату/время
            // id можно генерировать здесь или уровнем выше (в App.js при добавлении в список)
        };

        // Вызываем onSave, переданный из MainPage
        onSave(expenseData);
        // onClose(); // Закрытие теперь обрабатывается в MainPage после вызова onSave
    };

    // Если модалка не должна быть открыта, ничего не рендерим
    if (!isOpen) {
        return null;
    }

    // JSX разметка модального окна
    return (
        <div className="modal-overlay" onClick={onClose}> {/* Закрытие по клику на фон */}
            <div className="modal-content-new" onClick={(e) => e.stopPropagation()}> {/* Сам контент, клик по нему не закрывает */}

                {/* Поле ввода суммы */}
                <input
                    type="number"
                    className="amount-input"
                    placeholder="Enter the amount of money"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    autoFocus // Автофокус на поле суммы
                />

                {/* Заголовок для категории */}
                <h4 className="category-title">Category</h4>

                {/* НОВОЕ: Поле ввода категории */}
                <input
                    type="text"
                    className="amount-input" // Используем тот же стиль
                    placeholder="Enter category name"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                />

                {/* Отображение ошибки валидации */}
                {error && <p className="error-message-new">{error}</p>}

                {/* Кнопка "Done" */}
                <button className="done-btn-new" onClick={handleSave}>
                    Done
                </button>
            </div>
        </div>
    );
}

export default ExpenseModal;