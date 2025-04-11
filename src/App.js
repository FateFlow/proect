// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainPage from './pages/MainPage';
import SpendPage from './pages/SpendPage';
import BillsPage from './pages/BillsPage';
import HistoryPage from './pages/HistoryPage';
import AccountPage from './pages/AccountPage';
import ReportPage from './pages/ReportPage';
import PlanPage from './pages/PlanPage';
import NavigationBar from './components/NavigationBar';
import ExpenseModal from './components/ExpenseModal';

import './styles/variables.css';
import './styles/global.css';

function App() {
  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);

  const handleOpenModal = () => {
    setExpenseModalOpen(true);
  };

  const handleCloseModal = () => {
    setExpenseModalOpen(false);
  };

  const handleAddExpense = (expense) => {
    setExpenses(prev => [...prev, expense]);
    console.log("Added expense:", expense);
    // Обновляем логику для HistoryPage при необходимости
  };

  return (
    <Router>
      {/* Удаляем или комментируем компонент SearchBar */}
      {/* <SearchBar /> */}
      
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/spend" element={<SpendPage />} />
        <Route path="/bills" element={<BillsPage />} />
        <Route path="/history" element={<HistoryPage expenses={expenses} />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/plan" element={<PlanPage />} />
      </Routes>
      <NavigationBar onOpenModal={handleOpenModal} />
      <ExpenseModal 
        isOpen={isExpenseModalOpen}
        onClose={handleCloseModal}
        onAddExpense={handleAddExpense} 
      />
    </Router>
  );
}

export default App;
