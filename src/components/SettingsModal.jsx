// src/components/SettingsModal.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
// Импортируем useCurrency для selectedCurrency и setSelectedCurrency,
// BASE_DB_CURRENCY для значения по умолчанию.
// SUPPORTED_CURRENCIES больше не нужен для генерации списка.
import { useCurrency, BASE_DB_CURRENCY } from '../contexts/CurrencyContext';
import '../styles/expenseModal.css';
import '../styles/settingsModal.css';

function SettingsModal({ isOpen, onClose, currentUserData, onSettingsSaved, onLogout }) {
    const {
        selectedCurrency: contextSelectedCurrency,
        setSelectedCurrency: setContextSelectedCurrency,
    } = useCurrency();

    const [editableName, setEditableName] = useState('');
    // modalSelectedCurrencyUI теперь всегда будет BYN, так как других опций нет
    // Но мы все равно будем его синхронизировать с контекстом, на случай если в будущем вернем другие валюты
    const [modalSelectedCurrencyUI, setModalSelectedCurrencyUI] = useState(BASE_DB_CURRENCY);

    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            const nameToSet = currentUserData?.name || '';
            setEditableName(nameToSet);
            // Устанавливаем валюту в UI модалки из контекста (которая по идее должна быть BYN или тем, что было сохранено)
            // Но так как выбор будет только BYN, это значение все равно установится в BYN при сохранении, если отличается.
            setModalSelectedCurrencyUI(contextSelectedCurrency || BASE_DB_CURRENCY);
            console.log(`SettingsModal (BYN ONLY MODE): Initializing. Name: '${nameToSet}', Currency UI: '${contextSelectedCurrency || BASE_DB_CURRENCY}'`);
            setSaveError(null);
            setIsSaving(false);
        }
    }, [isOpen, currentUserData, contextSelectedCurrency]);

    const handleSaveChanges = async () => {
        setIsSaving(true);
        setSaveError(null);

        const updates = {};
        const currentNameInDb = currentUserData?.name || '';
        const trimmedEditableName = editableName.trim();

        if (trimmedEditableName !== currentNameInDb) {
            updates.name = trimmedEditableName;
        }

        // Валюта, выбранная в модалке, теперь всегда будет BYN, так как других опций нет.
        // Но для консистентности, если вдруг contextSelectedCurrency был чем-то другим (например, из старого localStorage),
        // мы все равно обновим его на BYN.
        const newSelectedCurrencyInModal = BASE_DB_CURRENCY; // <--- Всегда BYN

        if (updates.name || newSelectedCurrencyInModal !== contextSelectedCurrency) {
            if (updates.name) {
                try {
                    console.log("SettingsModal (BYN ONLY MODE): Saving profile name update:", { name: updates.name });
                    await apiClient.patch('/user/profile', { name: updates.name });
                    console.log("SettingsModal (BYN ONLY MODE): Profile name updated successfully.");
                } catch (err) {
                    console.error("SettingsModal (BYN ONLY MODE): Failed to save name:", err);
                    setSaveError(err.response?.data?.message || err.message || 'Failed to save name.');
                    setIsSaving(false);
                    return;
                }
            }

            if (newSelectedCurrencyInModal !== contextSelectedCurrency) {
                console.log(`SettingsModal (BYN ONLY MODE): Setting currency in context to: '${newSelectedCurrencyInModal}'.`);
                setContextSelectedCurrency(newSelectedCurrencyInModal);
            }
            
            if (onSettingsSaved) onSettingsSaved();
            onClose();

        } else {
            console.log("SettingsModal (BYN ONLY MODE): No changes detected.");
            onClose();
        }
        setIsSaving(false);
    };

    if (!isOpen) { return null; }
    const handleContentClick = (e) => e.stopPropagation();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content-new settings-modal-content" onClick={handleContentClick}>
                <h4 className="settings-modal-title">Settings</h4>
                <div className="settings-list">
                    <div className="setting-item">
                        <label htmlFor="profileName" className="setting-label">Name:</label>
                        <input
                            id="profileName" type="text" className="setting-input"
                            value={editableName} onChange={(e) => setEditableName(e.target.value)} disabled={isSaving}
                        />
                    </div>
                    <div className="setting-item">
                        <label htmlFor="currency-select" className="setting-label">Display Currency Preference:</label>
                        <select
                            id="currency-select" className="setting-select"
                            value={modalSelectedCurrencyUI} // Это будет всегда BYN, так как других опций нет
                            // onChange больше не нужен, так как выбор заблокирован на BYN
                            disabled={true} // <--- Делаем селект неактивным
                        >
                            {/* Жестко задаем одну опцию BYN */}
                            <option value={BASE_DB_CURRENCY}>{BASE_DB_CURRENCY}</option>
                        </select>
                    </div>
                    {saveError && <p className="error-message-new">{saveError}</p>}
                    <button onClick={handleSaveChanges} className="setting-action-button save-button" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button onClick={onLogout} className="setting-action-button logout-button" disabled={isSaving}>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SettingsModal;