// src/components/SupportModal.jsx
import React from 'react';
import '../styles/supportModal.css';
import '../styles/expenseModal.css'; // Оставляем, т.к. используем .modal-overlay, .modal-content-new, .done-btn-new


function SupportModal({ isOpen, onClose }) {
    // Если модалка не должна быть открыта, ничего не рендерим
    if (!isOpen) {
        return null;
    }

    // Предотвращаем закрытие модалки при клике на сам контент
    const handleContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            {/* У ЭТОГО DIV ТОЧНО ЕСТЬ КЛАСС support-modal-content? */}
            <div className="modal-content-new support-modal-content" onClick={handleContentClick}>

                {/* У ЭТОГО H4 ТОЧНО ЕСТЬ КЛАСС support-modal-title? */}
                <h4 className="category-title support-modal-title">Support</h4>

                {/* У ЭТОГО P ТОЧНО ЕСТЬ КЛАСС support-modal-text? */}
                <p className="support-modal-text">
                    If you need help, please contact us:
                </p>

                {/* У ЭТОЙ ССЫЛКИ A ТОЧНО ЕСТЬ КЛАСС support-email-link? */}
                <a href="mailto:support@example.com" className="support-email-link">
                    support@example.com
                </a>

                {/* У ЭТОГО P ТОЧНО ЕСТЬ КЛАССЫ support-modal-text И faq-text? */}
                <p className="support-modal-text faq-text">
                    FAQ section is coming soon!
                </p>

                {/* У ЭТОЙ КНОПКИ ТОЧНО ЕСТЬ КЛАСС done-btn-new? */}
                <button className="done-btn-new" onClick={onClose}>
                  Close
                </button>
            </div>
        </div>
    );
}

export default SupportModal;