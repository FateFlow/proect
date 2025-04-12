import React, { useState } from 'react';
// Убери импорты Link, если кнопки Bills/History не ведут на другие страницы напрямую
// import { Link } from 'react-router-dom';
import './../styles/mainPage.css';

// --- SVG Иконки ---
// Замени плейсхолдеры на твои SVG компоненты или прямой SVG код
const BillsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="var(--icon-color)">
    {/* ТВОЙ SVG КОД ДЛЯ BILLS ЗДЕСЬ */}
    <path fillRule="evenodd" clipRule="evenodd" d="M6 3C4.34315 3 3 4.34315 3 6V18C3 19.6569 4.34315 21 6 21H18C19.6569 21 21 19.6569 21 18V6C21 4.34315 19.6569 3 18 3H6ZM5 6C5 5.44772 5.44772 5 6 5H18C18.5523 5 19 5.44772 19 6V18C19 18.5523 18.5523 19 18 19H6C5.44772 19 5 18.5523 5 18V6Z" fill="currentColor" fillOpacity="0.5"/>
    <path d="M7 8C7 7.44772 7.44772 7 8 7H16C16.5523 7 17 7.44772 17 8C17 8.55228 16.5523 9 16 9H8C7.44772 9 7 8.55228 7 8Z" fill="currentColor"/>
    <path d="M7 12C7 11.4477 7.44772 11 8 11H16C16.5523 11 17 11.4477 17 12C17 12.5523 16.5523 13 16 13H8C7.44772 13 7 12.5523 7 12Z" fill="currentColor"/>
    <path d="M7 16C7 15.4477 7.44772 15 8 15H12C12.5523 15 13 15.4477 13 16C13 16.5523 12.5523 17 12 17H8C7.44772 17 7 16.5523 7 16Z" fill="currentColor"/>
  </svg>
);

const HistoryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="var(--icon-color)">
    {/* ТВОЙ SVG КОД ДЛЯ HISTORY ЗДЕСЬ */}
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12Z" fill="currentColor" fillOpacity="0.5"/>
    <path d="M12 7C11.4477 7 11 7.44772 11 8V12C11 12.2652 11.1054 12.5196 11.2929 12.7071L14.1213 15.5355C14.5118 15.9261 15.145 15.9261 15.5355 15.5355C15.9261 15.145 15.9261 14.5118 15.5355 14.1213L13 11.5858V8C13 7.44772 12.5523 7 12 7Z" fill="currentColor"/>
  </svg>
);

const PlusIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#FFFFFF"> {/* Белая иконка плюса */}
        {/* ТВОЙ SVG КОД ДЛЯ БОЛЬШОГО ПЛЮСА ЗДЕСЬ */}
        <path d="M12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11H13V5C13 4.44772 12.5523 4 12 4Z" fill="currentColor"/>
    </svg>
);
// --- Конец SVG Иконок ---


function MainPage() {
  // Состояние для баланса и сбережений (пока статика)
  const [balance, setBalance] = useState(783.81);
  const [savingsTarget, setSavingsTarget] = useState(500); // Цель накоплений
  const [currentSavings, setCurrentSavings] = useState(233); // Текущие накопления

  // Заглушки для обработчиков
  const handleEditBalance = () => {
    console.log("Нажата кнопка Edit Balance");
    // Здесь будет логика открытия модального окна для изменения баланса
    // Например: prompt() для простоты или вызов функции открытия модалки
    const addedAmount = parseFloat(prompt("Enter amount to add to balance:", "0"));
    if (!isNaN(addedAmount) && addedAmount > 0) {
        setBalance(prevBalance => prevBalance + addedAmount);
    }
  };

  const handleAddSpending = () => {
    console.log("Нажата кнопка Add Spending (+)");
    // Здесь будет логика открытия модального окна добавления расхода (как на Фото 2)
  };

    const handleOpenBills = () => {
        console.log("Нажата кнопка Bills");
        // Возможно, навигация или другое действие
    };

    const handleOpenHistory = () => {
        console.log("Нажата кнопка History");
        // Возможно, навигация или другое действие
    };

    const handleEditSavings = () => {
        console.log("Нажата кнопка '...' (Edit Savings)");
        // Логика изменения цели накоплений
         const newTarget = parseFloat(prompt("Enter new savings target:", savingsTarget));
         if (!isNaN(newTarget) && newTarget > 0) {
             setSavingsTarget(newTarget);
         }
    };


  // Расчет процента для прогресс-бара
  const savingsProgressPercent = savingsTarget > 0 ? (currentSavings / savingsTarget) * 100 : 0;

  return (
    <div className="main-page-layout">
      {/* --- Верхний зеленый блок --- */}
      <div className="top-balance-section">
        <span className="balance-label">Available balance</span>
        <h1 className="balance-amount">BYN {balance.toFixed(2)}</h1>
        <button className="edit-button" onClick={handleEditBalance}>Edit</button>
      </div>

      {/* --- Основной контент (белый блок с кнопками и серый блок сбережений) --- */}
      <div className="main-content-area">

        {/* --- Блок с кнопками действий (Белый) --- */}
        <div className="action-buttons-container">
          <button className="action-button action-button-side" onClick={handleOpenBills}>
            <BillsIcon />
            <span>Bills</span>
          </button>
          <button className="action-button-center" onClick={handleAddSpending}>
            <PlusIcon />
            {/* Текст "Add spending" может быть не нужен, если есть только "+" */}
             {/* <span>Add spending</span> */}
          </button>
          <button className="action-button action-button-side" onClick={handleOpenHistory}>
            <HistoryIcon />
            <span>History</span>
          </button>
        </div>

        {/* --- Блок Сбережений (Серый) --- */}
        <div className="savings-card">
            <div className="savings-header">
                 <h2 className="savings-title">Savings</h2>
                 <button className="savings-edit-button" onClick={handleEditSavings}>•••</button>
            </div>
          <p className="savings-description">Set your own goals for a month or year</p>
          <div className="savings-progress-area">
             {/* Здесь должна быть картинка свинки, но мы ее игнорируем */}
             {/* <img src="/path/to/piggy-bank.png" alt="Piggy bank" className="savings-image" /> */}

            <div className="progress-bar-container">
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{ height: `${Math.min(savingsProgressPercent, 100)}%` }} // Ограничиваем 100%
                ></div>
              </div>
              <div className="progress-labels">
                <span className="progress-label-top">— {savingsTarget.toFixed(0)}$</span>
                <span className="progress-label-current">— {currentSavings.toFixed(0)}$</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Navigation Bar будет отображаться через App.js */}
    </div>
  );
}

export default MainPage;