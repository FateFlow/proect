// src/components/SupportModal.jsx
import React from 'react';
// Импортируем стили
import '../styles/expenseModal.css';
import '../styles/accountPage.css';

function SupportModal({ isOpen, onClose }) {

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content-new" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">Support</h3>

                <div className="modal-basic-content">
                    <p>If you need help, please contact us:</p>
                    <p><strong>support@example.com</strong></p>
                    <p style={{ marginTop: '20px' }}>FAQ section is coming soon!</p>
                </div>

                <button className="done-btn-new" style={{marginTop: '25px'}} onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
}

export default SupportModal;