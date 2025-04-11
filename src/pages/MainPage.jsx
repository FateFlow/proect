import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/mainPage.css';

const MainPage = () => {
  return (
    <div className="page main-page">
      {/* Верхняя шапка с балансом */}
      <div className="header-section">
        <div className="balance-section">
          <h2 className="balance-amount">BYN 783.81</h2>
          <p className="balance-label">Available balance</p>
        </div>
      </div>

      {/* Нижний контейнер с двумя блоками */}
      <div className="bottom-cards">
        {/* Блок с тремя кнопками */}
        <div className="action-buttons-container">
          <div className="action-buttons">
            <Link to="/spend" className="action-button">Spend</Link>
            <Link to="/bills" className="action-button">Bills</Link>
            <Link to="/history" className="action-button">History</Link>
          </div>
        </div>

        {/* Бокс Savings */}
        <div className="savings-container">
          <div className="savings-section">
            <div className="savings-info">
              <img src="/icons/pig.svg" alt="Piggy Bank" className="pig-icon" />
              <div className="savings-text">
                <p className="savings-title">Savings</p>
                <p className="savings-amount">$233 / $500</p>
              </div>
            </div>
            <div className="vertical-progress">
              <div className="progress-track">
                <div className="progress-fill" style={{ height: '46%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
