import React from 'react'; // Убрали useState, т.к. он больше не нужен здесь
import '../styles/historyPage.css';

// --- УДАЛИЛИ sampleHistory ---

// --- Принимаем transactions из пропсов ---
function HistoryPage({ transactions }) {

  // --- УДАЛИЛИ useState для historyData ---

  // Функция для форматирования даты (если данные из localStorage/API будут требовать этого)
  const formatDate = (isoDateString) => {
      // Проверяем, что строка даты есть и она валидна
      if (!isoDateString) return 'No date';
      const date = new Date(isoDateString);
      if (isNaN(date.getTime())) return 'Invalid date'; // Проверка на невалидную дату

      // Форматируем в '12 May' (или другой нужный формат)
      // Убедитесь, что локаль 'en-GB' вам подходит
      try {
         return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      } catch (e) {
          console.error("Error formatting date:", e);
          return 'Date error';
      }
  };


  return (
    <div className="history-page-container">
      <div className="history-content-card">
        <h1 className="history-title">Transactions</h1>

        {/* --- Используем transactions.length --- */}
        {transactions && transactions.length > 0 ? (
          <div className="history-list">
            {/* --- Используем transactions.map --- */}
            {transactions.map((item) => (
              <div key={item.id} className="history-item">
                <div className="history-item-details">
                  <span className="history-item-category">{item.category}</span>
                  {/* Используем formatDate для даты из транзакции */}
                  <span className="history-item-date">{formatDate(item.date)}</span>
                </div>
                <span className={`history-item-amount ${item.type}`}>
                  {item.type === 'income' ? '+' : '-'}BYN {item.amount?.toFixed(2) ?? '0.00'} {/* Добавили toFixed(2) и проверку */}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-history-message">No transactions recorded yet.</p>
        )}
      </div>

      {/* Компенсация высоты нижней навигации */}
      <div style={{ height: '80px' }}></div>
    </div>
  );
}

export default HistoryPage;