// src/components/SettingsModal.jsx
import React from 'react';
// Импортируем стили, где лежат классы для модалок
import '../styles/expenseModal.css'; // Стили фона и обертки
import '../styles/accountPage.css'; // Стили для контента модалки

function SettingsModal({ isOpen, onClose }) {

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content-new" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">Settings</h3>

                <div className="modal-basic-content">
                    <p>Here you can adjust application settings.</p>
                    {/* Добавим плейсхолдеры */}
                    <button className="modal-button" style={{ width: '100%', marginBottom: '10px' }} onClick={onClose}>
                        Change Password (Soon)
                    </button>
                    <button className="modal-button" style={{ width: '100%', backgroundColor: 'var(--medium-text)' }} onClick={onClose}>
                        Notification Preferences (Soon)
                    </button>
                </div>

                {/* Можно добавить кнопку закрытия */}
                 <button className="done-btn-new" style={{marginTop: '25px'}} onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
}

export default SettingsModal;