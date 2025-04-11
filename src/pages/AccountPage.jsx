// src/pages/AccountPage.jsx
import React, { useState } from 'react';
import '../styles/accountPage.css';

const AccountPage = () => {
  const [isDarkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!isDarkMode);
    // Здесь можно добавить логику переключения темы (например, через добавление/удаление класса)
  };

  return (
    <div className="page account-page">
      <h1>Account Settings</h1>
      <div className="theme-toggle">
        <label>
          Dark Mode:
          <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} />
        </label>
      </div>
      <button className="settings-button" disabled>Settings</button>
      <button className="support-button" disabled>Support</button>
    </div>
  );
};

export default AccountPage;
