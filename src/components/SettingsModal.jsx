// src/components/SettingsModal.jsx
import React, { useState } from 'react';
import '../styles/expenseModal.css'; // Базовые стили модалки
import '../styles/settingsModal.css'; // Новые стили для настроек

function SettingsModal({ isOpen, onClose }) {
  // Состояние для выбранной валюты (позже брать из настроек пользователя)
  const [selectedCurrency, setSelectedCurrency] = useState('BYN');
  // Состояние для темы (позже брать из настроек/localStorage)
  const [theme, setTheme] = useState('light'); // 'light' или 'dark'

  // --- Обработчики (пока просто для примера) ---
  const handleCurrencyChange = (event) => {
    setSelectedCurrency(event.target.value);
    console.log('Currency selected:', event.target.value);
    // TODO: Сохранить выбор пользователя (localStorage/API)
    // TODO: Обновить отображение валюты во всем приложении
  };

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    console.log('Theme toggled to:', newTheme);
    // TODO: Применить стили темы (например, добавить класс к body или использовать Context)
    // document.body.className = newTheme + '-theme'; // Простой пример
  };

  const handleChangePassword = () => {
    console.log('Change Password clicked (Not implemented)');
    // TODO: Открыть новую модалку/страницу для смены пароля
    onClose(); // Закрываем эту модалку для примера
  };

  const handleNotifications = () => {
    console.log('Notification Preferences clicked (Not implemented)');
    // TODO: Открыть страницу/модалку настроек уведомлений
     onClose(); // Закрываем эту модалку для примера
  };
  // --- Конец обработчиков ---

  if (!isOpen) {
    return null;
  }

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-new settings-modal-content" onClick={handleContentClick}>

        <h4 className="settings-modal-title">Settings</h4>
        <p className="settings-modal-description">
          Here you can adjust application settings.
        </p>

        {/* --- Настройки в виде списка --- */}
        <div className="settings-list">

          {/* Настройка Валюты */}
          <div className="setting-item">
            <label htmlFor="currency-select" className="setting-label">Default Currency:</label>
            <select
              id="currency-select"
              className="setting-select"
              value={selectedCurrency}
              onChange={handleCurrencyChange}
            >
              <option value="BYN">BYN</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              {/* Добавить другие валюты по необходимости */}
            </select>
          </div>

          {/* Настройка Темы */}
          <div className="setting-item">
            <span className="setting-label">Theme:</span>
            <button onClick={handleThemeToggle} className="theme-toggle-button">
              Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
            </button>
            {/* Можно использовать реальный <input type="checkbox"> и стилизовать его как toggle */}
          </div>

          {/* Кнопка Смены Пароля */}
          <button onClick={handleChangePassword} className="setting-action-button password-button">
             Change Password (Soon)
          </button>

           {/* Кнопка Настроек Уведомлений */}
          <button onClick={handleNotifications} className="setting-action-button notification-button">
             Notification Preferences (Soon)
          </button>

        </div>
        {/* --- Конец списка настроек --- */}

        <button className="done-btn-new" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default SettingsModal;