// src/components/SettingsModal.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../services/api'; // Нужен для сохранения
import '../styles/expenseModal.css';
import '../styles/settingsModal.css'; // Подключаем стили

// Принимаем новые пропсы
function SettingsModal({ isOpen, onClose, currentUserData, onSettingsSaved, onLogout }) {
    // Локальное состояние для редактируемых полей
    const [editableName, setEditableName] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState('');
    // Состояния для процесса сохранения
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    // Инициализация состояний при открытии или изменении данных пользователя
    useEffect(() => {
        if (isOpen && currentUserData) {
            setEditableName(currentUserData.name || '');
            setSelectedCurrency(currentUserData.currency || 'BYN'); // Используем BYN по умолчанию
            setSaveError(null); // Сброс ошибки при открытии
            setIsSaving(false); // Сброс флага сохранения
        }
    }, [isOpen, currentUserData]);

    // Обработчик сохранения изменений
    const handleSaveChanges = async () => {
        setIsSaving(true);
        setSaveError(null);

        // Собираем только те поля, которые изменились
        const updates = {};
        if (editableName !== currentUserData.name) {
            updates.name = editableName.trim();
        }
        if (selectedCurrency !== currentUserData.currency) {
            updates.currency = selectedCurrency;
        }

        // Если нет изменений, просто закрываем окно
        if (Object.keys(updates).length === 0) {
            console.log("No changes detected.");
            onClose();
            return;
        }

        // Валидация имени (если нужно)
        if (updates.name && updates.name.length === 0) {
             setSaveError("Name cannot be empty.");
             setIsSaving(false);
             return;
        }

        console.log("Saving profile updates:", updates);
        try {
            // Отправляем PATCH запрос
            const response = await apiClient.patch('/user/profile', updates);
            console.log("Profile updated successfully:", response.data);

             // Сохраняем новую валюту в localStorage СРАЗУ ЖЕ
             if (updates.currency) {
                localStorage.setItem('userCurrency', updates.currency);
                console.log(`Currency saved to localStorage: ${updates.currency}`);
            }

            onSettingsSaved(); // Вызываем колбэк для обновления AccountPage
            onClose();         // Закрываем модалку
        } catch (err) {
            console.error("Failed to save settings:", err);
            setSaveError(err.response?.data?.message || err.message || 'Failed to save settings.');
        } finally {
            setIsSaving(false);
        }
    };


    if (!isOpen) { return null; }

    const handleContentClick = (e) => e.stopPropagation();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content-new settings-modal-content" onClick={handleContentClick}>
                <h4 className="settings-modal-title">Settings</h4>

                <div className="settings-list">
                    {/* Редактирование Имени */}
                    <div className="setting-item">
                        <label htmlFor="profileName" className="setting-label">Name:</label>
                        <input
                            id="profileName"
                            type="text"
                            className="setting-input" // Новый класс для инпутов настроек
                            value={editableName}
                            onChange={(e) => setEditableName(e.target.value)}
                            disabled={isSaving}
                        />
                    </div>

                    {/* Выбор Валюты */}
                    <div className="setting-item">
                        <label htmlFor="currency-select" className="setting-label">Default Currency:</label>
                        <select
                            id="currency-select"
                            className="setting-select" // Используем старый класс для селекта
                            value={selectedCurrency}
                            onChange={(e) => setSelectedCurrency(e.target.value)}
                            disabled={isSaving}
                        >
                            <option value="BYN">BYN</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                        </select>
                    </div>

                     {/* Отображение ошибки сохранения */}
                     {saveError && <p className="error-message-new">{saveError}</p>}

                    {/* Кнопка Сохранения */}
                    <button
                        onClick={handleSaveChanges}
                        className="setting-action-button save-button" // Новый класс
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>

                     {/* Кнопка Выхода */}
                     <button
                        onClick={onLogout} // Используем функцию из пропсов
                        className="setting-action-button logout-button" // Новый класс
                        disabled={isSaving} // Блокируем во время сохранения
                     >
                        Logout
                     </button>

                </div>

                {/* Кнопку Close убираем, т.к. есть Save и Логаут */}
                {/* <button className="done-btn-new" onClick={onClose}> Close </button> */}
            </div>
        </div>
    );
}

export default SettingsModal;