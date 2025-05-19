// src/pages/HistoryPage.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import '../styles/historyPage.css';
import { useCurrency } from '../contexts/CurrencyContext';

function HistoryPage() {
    const { formatCurrency } = useCurrency();

    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('HistoryPage (useEffect): Component logic running. formatCurrency type:', typeof formatCurrency);
        const fetchTransactions = async () => {
            setIsLoading(true);
            setError(null);
            setTransactions([]);
            try {
                console.log("HistoryPage: Fetching transactions...");
                const response = await apiClient.get('/transactions');
                if (response.data && Array.isArray(response.data.transactions)) {
                    setTransactions(response.data.transactions);
                    console.log("HistoryPage: Transactions loaded:", response.data.transactions.length);
                } else {
                    throw new Error('Invalid data received for transactions');
                }
            } catch (err) {
                console.error("HistoryPage: Failed to fetch transactions:", err);
                setError(err.response?.data?.message || err.message || 'Не удалось загрузить историю транзакций.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchTransactions();
    }, [formatCurrency]); // <--- ВОТ ИЗМЕНЕНИЕ

    const formatDate = (isoDateString) => {
      // ... (без изменений)
      if (!isoDateString) return 'No date';
      const date = new Date(isoDateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      try {
         return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
      } catch (e) {
          console.error("Error formatting date:", e);
          return 'Date error';
      }
    };

    const renderFormattedAmount = (amount) => {
        return formatCurrency(amount);
    };

    console.log("HistoryPage: Rendering component. isLoading:", isLoading, "Error:", error, "Transactions count:", transactions.length);

    return (
        // ... JSX без изменений ...
        <div className="history-page-container">
            <div className="history-content-card">
                <h1 className="history-title">Transactions</h1>
                {isLoading && <p className="loading-message">Loading history...</p>}
                {!isLoading && error && <p className="error-message">{error}</p>}
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
                                        {renderFormattedAmount(item.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        !isLoading && <p className="no-history-message">No transactions recorded yet.</p>
                    )
                )}
            </div>
        </div>
    );
}
export default HistoryPage;