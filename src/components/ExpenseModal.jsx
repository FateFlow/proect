// src/components/ExpenseModal.jsx
import React, { useState } from 'react';
import '../styles/expenseModal.css';

const ExpenseModal = ({ isOpen, onClose, onAddExpense }) => {
  const [expenseInput, setExpenseInput] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (expenseInput.trim() !== '') {
      onAddExpense(expenseInput);
      setExpenseInput('');
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === 'expense-modal-overlay') {
      onClose();
    }
  };

  return (
    <div className="expense-modal-overlay" onClick={handleOverlayClick}>
      <div className="expense-modal">
        <h3>Add Expense</h3>
        <input
          type="text"
          value={expenseInput}
          onChange={(e) => setExpenseInput(e.target.value)}
          placeholder="Enter expense details..."
        />
        <button className="add-expense-button" onClick={handleAdd}>
          Add
        </button>
      </div>
    </div>
  );
};

export default ExpenseModal;
