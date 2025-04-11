// src/components/NavigationBar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/navigation.css';

const NavigationBar = ({ onOpenModal }) => {
  const location = useLocation();

  return (
    <div className="navigation-bar">
      <nav className="bottom-nav">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          <img src="/icons/menu.svg" alt="Menu" />
          <span>Menu</span>
        </Link>
        <Link to="/account" className={`nav-link ${location.pathname === '/account' ? 'active' : ''}`}>
          <img src="/icons/account.svg" alt="Account" />
          <span>Account</span>
        </Link>

        {/* Центральная кнопка для добавления расхода */}
        <button className="add-spend-button" onClick={onOpenModal}>
          <img src="/icons/add.svg" alt="Add" />
        </button>

        <Link to="/report" className={`nav-link ${location.pathname === '/report' ? 'active' : ''}`}>
          <img src="/icons/report.svg" alt="Report" />
          <span>Report</span>
        </Link>
        <Link to="/plan" className={`nav-link ${location.pathname === '/plan' ? 'active' : ''}`}>
          <img src="/icons/plan.svg" alt="Plan" />
          <span>Plan</span>
        </Link>
      </nav>
    </div>
  );
};

export default NavigationBar;
