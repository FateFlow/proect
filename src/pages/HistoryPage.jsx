// src/pages/HistoryPage.jsx
import React, { useState, useEffect } from 'react'; // Добавили useState, useEffect
import apiClient from '../services/api'; // Импортируем API клиент
import '../styles/historyPage.css'; // Подключаем стили
import { formatCurrency } from '../utils/formatting';

function HistoryPage() { // Убрали пропс transactions
    // --- НОВЫЕ СОСТОЯНИЯ ---
    const [transactions, setTransactions] = useState([]); // Храним список транзакций
    const [isLoading, setIsLoading] = useState(true); // Состояние загрузки
    const [error, setError] = useState(null); // Состояние ошибки
    // Дополнительные состояния для пагинации (позже)
    // const [currentPage, setCurrentPage] = useState(1);
    // const [totalPages, setTotalPages] = useState(1);

    // --- useEffect ДЛЯ ЗАГРУЗКИ ДАННЫХ ---
    useEffect(() => {
        const fetchTransactions = async () => {
            setIsLoading(true);
            setError(null);
            setTransactions([]); // Сбрасываем перед загрузкой
            try {
                // Запрашиваем первую страницу транзакций (по умолчанию лимит 10, сортировка по дате)
                const response = await apiClient.get('/transactions'); // Можно добавить ?page=1&limit=20 и т.д.

                // Ожидаем ответ вида { success: true, transactions: [...] }
                if (response.data && Array.isArray(response.data.transactions)) {
                    setTransactions(response.data.transactions);
                    // Сохраняем данные пагинации (если нужно)
                    // if (response.data.pagination) {
                    //     setCurrentPage(response.data.pagination.currentPage);
                    //     setTotalPages(response.data.pagination.totalPages);
                    // }
                    console.log("Transactions loaded:", response.data.transactions);
                } else {
                    throw new Error('Invalid data received for transactions');
                }
            } catch (err) {
                console.error("Failed to fetch transactions:", err);
                setError(err.response?.data?.message || err.message || 'Не удалось загрузить историю транзакций.');
                // Оставляем transactions пустым массивом
            } finally {
                setIsLoading(false); // Завершаем загрузку
            }
        };

        fetchTransactions(); // Вызываем загрузку
    }, []); // Пустой массив - загрузка один раз при монтировании

    // Функция форматирования даты (оставляем)
    const formatDate = (isoDateString) => {
      if (!isoDateString) return 'No date';
      const date = new Date(isoDateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      try {
         // Используем короткий месяц и день
         return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
      } catch (e) {
          console.error("Error formatting date:", e);
          return 'Date error';
      }
    };

    return (
        // Добавляем класс для возможности стилизации через CSS (padding-bottom)
        <div className="history-page-container">
            <div className="history-content-card">
                <h1 className="history-title">Transactions</h1>

                {/* Отображение загрузки */}
                {isLoading && <p className="loading-message">Loading history...</p>}

                {/* Отображение ошибки */}
                {!isLoading && error && <p className="error-message">{error}</p>}

                {/* Отображение списка или сообщения "нет транзакций" */}
                {!isLoading && !error && (
                    transactions.length > 0 ? (
                        <div className="history-list">
                            {transactions.map((item) => (
                                <div key={item.id} className="history-item">
                                    <div className="history-item-details">
                                         <span className="history-item-category">{item.category || 'Без категории'}</span>
                                         <span className="history-item-date">{formatDate(item.date)}</span>
                                     </div>
                                    <span className={`history-item-amount ${item.type}`}>
                                        {item.type === 'income' ? '+' : '-'}
                                        {/* Используем хелпер */}
                                        {formatCurrency(item.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-history-message">No transactions recorded yet.</p>
                    )
                )}

                 {/* TODO: Добавить пагинацию, если totalPages > 1 */}

            </div>
            {/* --- УБРАЛИ div для компенсации высоты --- */}
        </div>
    );
}

export default HistoryPage;