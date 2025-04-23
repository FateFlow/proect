// src/pages/AccountPage.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Добавили useEffect, useCallback
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api'; // Наш API клиент
import '../styles/accountPage.css';
import SettingsModal from '../components/SettingsModal.jsx';
import SupportModal from '../components/SupportModal.jsx';
import { IoPersonCircleOutline, IoSettingsOutline, IoChevronForward, IoHelpBuoyOutline } from "react-icons/io5";
import { LuPencil } from "react-icons/lu";

function AccountPage() {
    // Состояния для данных пользователя, загрузки и ошибки
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Состояния для модальных окон
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
    const navigate = useNavigate(); // Для логаута

    // Функция загрузки данных профиля
    const fetchProfileData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/user/profile');
            if (response.data?.success && response.data.user) {
                setUserData(response.data.user);
                // Сохраняем валюту в localStorage при загрузке профиля
                if (response.data.user.currency) {
                    localStorage.setItem('userCurrency', response.data.user.currency);
                }
                console.log("User profile loaded:", response.data.user);
            } else {
                throw new Error('Failed to load user profile data');
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
            setError(err.response?.data?.message || err.message || 'Could not load profile.');
            // Если ошибка 401, нас автоматически перекинет на логин (из api.js)
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Загружаем данные при монтировании
    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    // Обработчики модалок
    const handleOpenSettings = () => setIsSettingsModalOpen(true);
    const handleCloseSettings = () => setIsSettingsModalOpen(false);
    const handleOpenSupport = () => setIsSupportModalOpen(true);
    const handleCloseSupport = () => setIsSupportModalOpen(false);

    // Функция, вызываемая после успешного сохранения настроек
    const handleSettingsSaved = () => {
        fetchProfileData(); // Перезагружаем данные профиля
    };

    // Функция для выхода из системы
    const handleLogout = () => {
        console.log("Logging out...");
        localStorage.removeItem('token'); // Удаляем токен
        localStorage.removeItem('userCurrency'); // Удаляем валюту
        navigate('/auth'); // Перенаправляем на страницу входа
        // Можно использовать window.location.href = '/auth'; для полной перезагрузки
    };

    // --- Отображение ---
    if (isLoading) {
        return <div className="loading-message">Loading Account...</div>; // Или спиннер
    }

    if (error) {
        return <div className="error-message">{error}</div>; // Показываем ошибку
    }

    // Если данных нет (маловероятно после загрузки, но все же)
    if (!userData) {
        return <div className="loading-message">User data not available.</div>;
    }

    // Нормальное отображение
    return (
        <div className="account-page-container">
            <div className="profile-section">
                <div className="avatar-container">
                    <IoPersonCircleOutline size={80} className="avatar-icon" />
                     {/* Кнопка Edit теперь открывает Настройки */}
                    <button className="edit-avatar-btn" onClick={handleOpenSettings}>
                        <LuPencil size={14} />
                    </button>
                </div>
                {/* Используем данные из userData */}
                <h2 className="user-name">{userData.name || 'User Name'}</h2>
                <p className="user-email">{userData.email}</p>
                <p className="user-phone">{userData.phone || 'No phone number'}</p>
            </div>

            <div className="action-list">
                <button className="action-item" onClick={handleOpenSettings}>
                    <div className="action-item-icon-wrapper settings"> <IoSettingsOutline size={22} className="action-item-icon" /> </div>
                    <span className="action-item-text">Settings</span>
                    <IoChevronForward size={18} className="action-item-arrow" />
                </button>
                <button className="action-item" onClick={handleOpenSupport}>
                    <div className="action-item-icon-wrapper support"> <IoHelpBuoyOutline size={22} className="action-item-icon" /> </div>
                    <span className="action-item-text">Support</span>
                    <IoChevronForward size={18} className="action-item-arrow" />
                </button>
                {/* Кнопка Выхода добавлена в SettingsModal */}
            </div>

            {/* Передаем нужные данные и функции в SettingsModal */}
            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={handleCloseSettings}
                currentUserData={userData} // Передаем текущие данные
                onSettingsSaved={handleSettingsSaved} // Функция для вызова после сохранения
                onLogout={handleLogout} // Передаем функцию логаута
            />
            <SupportModal isOpen={isSupportModalOpen} onClose={handleCloseSupport} />
        </div>
    );
}

export default AccountPage;