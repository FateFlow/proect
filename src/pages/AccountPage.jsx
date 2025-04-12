// src/pages/AccountPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Импорт остается
import '../styles/accountPage.css';
import SettingsModal from '../components/SettingsModal.jsx';
import SupportModal from '../components/SupportModal.jsx';
import { IoPersonCircleOutline, IoSettingsOutline, IoChevronForward, IoHelpBuoyOutline } from "react-icons/io5";
import { LuPencil } from "react-icons/lu";

function AccountPage() {
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
    const navigate = useNavigate(); // Объявляем navigate

    const userName = "Ivanov Ivan";
    const userEmail = "example123@gmail.com";
    const userPhone = "+375291234567";

    const handleEditProfile = () => {
        console.log("Edit Profile Clicked");
        // --- ИСПРАВЛЕНИЕ: Раскомментируем вызов navigate ---
        navigate('/edit-profile'); // Теперь navigate используется
    };

    const handleSettings = () => setIsSettingsModalOpen(true);
    const handleCloseSettings = () => setIsSettingsModalOpen(false);

    const handleSupport = () => setIsSupportModalOpen(true);
    const handleCloseSupport = () => setIsSupportModalOpen(false);

    return (
        <div className="account-page-container">
            {/* --- Секция Профиля --- */}
            <div className="profile-section">
                <div className="avatar-container">
                    <IoPersonCircleOutline size={80} className="avatar-icon" />
                     {/* --- Кнопка Edit вызывает handleEditProfile --- */}
                    <button className="edit-avatar-btn" onClick={handleEditProfile}>
                        <LuPencil size={14} />
                    </button>
                </div>
                <h2 className="user-name">{userName}</h2>
                <p className="user-email">{userEmail}</p>
                <p className="user-phone">{userPhone}</p>
            </div>

            {/* --- Список Действий --- */}
            <div className="action-list">
                 {/* --- Пункт Settings вызывает handleSettings --- */}
                <button className="action-item" onClick={handleSettings}>
                    <div className="action-item-icon-wrapper settings">
                        <IoSettingsOutline size={22} className="action-item-icon" />
                    </div>
                    <span className="action-item-text">Settings</span>
                    <IoChevronForward size={18} className="action-item-arrow" />
                </button>

                {/* --- Пункт Support вызывает handleSupport --- */}
                <button className="action-item" onClick={handleSupport}>
                    <div className="action-item-icon-wrapper support">
                        <IoHelpBuoyOutline size={22} className="action-item-icon" />
                    </div>
                    <span className="action-item-text">Support</span>
                    <IoChevronForward size={18} className="action-item-arrow" />
                </button>
            </div>

            {/* --- Рендеринг Модальных Окон --- */}
            <SettingsModal isOpen={isSettingsModalOpen} onClose={handleCloseSettings} />
            <SupportModal isOpen={isSupportModalOpen} onClose={handleCloseSupport} />

        </div>
    );
}

export default AccountPage;
