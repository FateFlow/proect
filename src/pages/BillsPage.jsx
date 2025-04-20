import React, { useState } from 'react';
import { FaHome, FaPlus } from 'react-icons/fa';
import '../styles/billsPage.css';    // Убедитесь, что путь верный
import '../styles/expenseModal.css'; // Убедитесь, что путь верный

const sampleBillsData = [
    { id: 1, icon: FaHome, name: 'Rent', category: 'living', amount: 500, period: 'month' },
    { id: 2, icon: FaHome, name: 'Internet', category: 'utilities', amount: 50, period: 'month' },
    { id: 3, icon: FaHome, name: 'Groceries', category: 'food', amount: 100, period: 'week' },
];

function BillsPage() {
    const [activeTab, setActiveTab] = useState('month');
    const [bills, setBills] = useState(sampleBillsData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBillAmount, setNewBillAmount] = useState('');
    const [newBillCategoryInput, setNewBillCategoryInput] = useState('');
    const [modalError, setModalError] = useState('');

    const filteredBills = bills.filter(bill => bill.period === activeTab);

    const handleOpenModal = () => {
        setIsModalOpen(true);
        setNewBillAmount('');
        setNewBillCategoryInput('');
        setModalError('');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleAddBill = () => {
        setModalError('');
        if (!newBillAmount.trim() || !newBillCategoryInput.trim()) {
            setModalError('Please enter both amount and category.');
            return;
        }
        const amount = parseFloat(newBillAmount);
        if (isNaN(amount) || amount <= 0) {
            setModalError('Please enter a valid positive amount.');
            return;
        }
        const newBill = {
            id: Date.now(),
            icon: FaHome,
            name: newBillCategoryInput.trim(),
            category: newBillCategoryInput.trim(),
            amount: amount,
            period: activeTab,
        };
        setBills(prevBills => [...prevBills, newBill]);
        handleCloseModal();
    };

    return (
        <div className="bills-page-container">

            {/* Верхняя панель */}
            <div className="bills-header">
                <div className="toggle-buttons">
                    <button
                        className={`toggle-btn ${activeTab === 'month' ? 'active' : ''}`}
                        onClick={() => setActiveTab('month')}
                    >
                        Per month
                    </button>
                    <button
                        className={`toggle-btn ${activeTab === 'week' ? 'active' : ''}`}
                        onClick={() => setActiveTab('week')}
                    >
                        Per week
                    </button>
                </div>
                <button className="add-bill-btn" onClick={handleOpenModal}>
                    <FaPlus /> Add bill
                </button>
            </div>

            {/* Список счетов */}
            <div className="bills-list">
                {filteredBills.length > 0 ? (
                    filteredBills.map((bill) => (
                        <div key={bill.id} className="bill-item">
                            <div className="bill-icon-wrapper">
                                <bill.icon />
                            </div>
                            <div className="bill-details">
                                <span className="bill-name">{bill.name}</span>
                                <span className="bill-category-hint">{bill.category}</span>
                            </div>
                            <span className="bill-amount">{bill.amount}$</span>
                        </div>
                    ))
                ) : (
                    <p className="no-bills-message">No bills for the selected period.</p>
                )}
            </div>

            {/* --- Модальное окно (без комментариев внутри) --- */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content-new" onClick={(e) => e.stopPropagation()}>
                        <input
                            type="number"
                            className="amount-input"
                            placeholder="Enter the amount of money"
                            value={newBillAmount}
                            onChange={(e) => setNewBillAmount(e.target.value)}
                            autoFocus
                        />
                        <h4 className="category-title">Category</h4>
                        <input
                            type="text"
                            className="amount-input"
                            placeholder="Enter category name"
                            value={newBillCategoryInput}
                            onChange={(e) => setNewBillCategoryInput(e.target.value)}
                        />
                        {modalError && <p className="error-message-new">{modalError}</p>}
                        <button className="done-btn-new" onClick={handleAddBill}>
                            Done
                        </button>
                    </div>
                </div>
            )}
            {/* --- Конец Модального окна --- */}

            {/* Компенсация высоты навигации */}
            <div style={{ height: '80px' }}></div>

        </div>
    );
}

export default BillsPage;