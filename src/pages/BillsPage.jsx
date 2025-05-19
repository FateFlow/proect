// src/pages/BillsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaHome, FaPlus, FaTrashAlt } from 'react-icons/fa';
import apiClient from '../services/api';
import '../styles/billsPage.css';
import '../styles/expenseModal.css'; // Убедись, что эти стили не конфликтуют или нужны
import { useCurrency } from '../contexts/CurrencyContext';

function BillsPage() {
    const { formatCurrency, BASE_DB_CURRENCY } = useCurrency();

    const [activeTab, setActiveTab] = useState('month');
    const [bills, setBills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingBillId, setDeletingBillId] = useState(null);

    // Состояния для модального окна
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddingBill, setIsAddingBill] = useState(false);
    const [addBillError, setAddBillError] = useState(null);
    const [newBillName, setNewBillName] = useState('');
    const [newBillAmount, setNewBillAmount] = useState('');
    const [newBillDueDate, setNewBillDueDate] = useState('');
    const [newBillCategory, setNewBillCategory] = useState('');
    // Состояние newBillNotes удалено

    const fetchBills = useCallback(async () => {
        setIsLoading(true); setError(null);
        try {
            const response = await apiClient.get('/bills', { params: { period: activeTab, limit: 100 } });
            if (response.data?.success && Array.isArray(response.data.bills)) {
                setBills(response.data.bills);
            } else {
                throw new Error('Invalid data received for bills');
            }
        } catch (err) {
            console.error(`Failed to fetch ${activeTab} bills:`, err);
            setError(err.response?.data?.message || err.message || 'Не удалось загрузить счета.');
            setBills([]);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchBills();
    }, [fetchBills]);

    const handleOpenModal = () => {
        setIsModalOpen(true);
        setNewBillName('');
        setNewBillAmount('');
        setNewBillDueDate('');
        setNewBillCategory('');
        // setNewBillNotes(''); // Удалено
        setAddBillError(null);
    };
    const handleCloseModal = () => setIsModalOpen(false);

    const handleAddBillSubmit = async () => {
        setAddBillError(null);
        if (!newBillName.trim() || !newBillAmount.trim() || !newBillDueDate.trim()) {
            setAddBillError('Name, Amount, and Due Date are required.');
            return;
        }
        const amount = parseFloat(newBillAmount);
        if (isNaN(amount) || amount <= 0) {
            setAddBillError('Please enter a valid positive amount.');
            return;
        }
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
        if (!dateRegex.test(newBillDueDate)) {
            setAddBillError('Due date must be in YYYY-MM-DD format.');
            return;
        }
        setIsAddingBill(true);
        try {
            const newBillData = {
                name: newBillName.trim(),
                amount: amount,
                due_date: newBillDueDate,
                period: activeTab,
                category: newBillCategory.trim() || null,
                // notes: поле удалено из объекта
            };
            await apiClient.post('/bills', newBillData);
            handleCloseModal();
            fetchBills(); // Обновляем список счетов
        } catch (err) {
            console.error("Failed to add bill:", err);
            setAddBillError(err.response?.data?.message || err.message || 'Failed to add bill.');
        } finally {
            setIsAddingBill(false);
        }
    };

    const handleDeleteBill = async (billId) => {
        if (!window.confirm(`Are you sure you want to delete this bill (ID: ${billId})?`)) {
            return;
        }
        setDeletingBillId(billId);
        setError(null);
        try {
            await apiClient.delete(`/bills/${billId}`);
            setBills(prevBills => prevBills.filter(bill => bill.id !== billId));
        } catch (err) {
            console.error(`Failed to delete bill ${billId}:`, err);
            setError(err.response?.data?.message || err.message || 'Failed to delete bill.');
        } finally {
            setDeletingBillId(null);
        }
    };

    const renderFormattedAmount = (amount) => {
        return formatCurrency(amount); // formatCurrency из контекста всегда вернет BYN
    };

    return (
        <div className="bills-page-container">
            <div className="bills-header">
                <div className="toggle-buttons">
                    <button className={`toggle-btn ${activeTab === 'month' ? 'active' : ''}`} onClick={() => setActiveTab('month')}> Per month </button>
                    <button className={`toggle-btn ${activeTab === 'week' ? 'active' : ''}`} onClick={() => setActiveTab('week')}> Per week </button>
                </div>
                <button className="add-bill-btn" onClick={handleOpenModal}> <FaPlus /> Add bill </button>
            </div>

            <div className="bills-list">
                {isLoading && <p className="loading-message">Loading bills...</p>}
                {!isLoading && error && !deletingBillId && <p className="error-message">{error}</p>}
                {!isLoading && !error && bills.length === 0 && <p className="no-bills-message">No bills found for this period.</p>}
                {!isLoading && !error && bills.length > 0 && (
                    bills.map((bill) => (
                        <div key={bill.id} className={`bill-item ${deletingBillId === bill.id ? 'deleting' : ''}`}>
                            <div className="bill-icon-wrapper"> <FaHome /> </div>
                            <div className="bill-details">
                                <span className="bill-name">{bill.name}</span>
                                <span className="bill-category-hint">{bill.category || 'No category'}</span>
                            </div>
                            <div className="bill-actions">
                                <span className="bill-amount">
                                    {renderFormattedAmount(bill.amount)}
                                </span>
                                <button className="delete-bill-btn" onClick={() => handleDeleteBill(bill.id)} disabled={deletingBillId === bill.id} >
                                    {deletingBillId === bill.id ? '...' : <FaTrashAlt />}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Модальное окно добавления счета БЕЗ ПОЛЯ NOTES */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content-new bill-modal" onClick={(e) => e.stopPropagation()}>
                        <h3 className="category-title" style={{ textAlign: 'center', marginBottom: '20px' }}>Add New Bill ({activeTab})</h3>
                        
                        <label htmlFor="billName">Bill Name*</label>
                        <input id="billName" type="text" className="amount-input" placeholder="e.g., Rent, Netflix" value={newBillName} onChange={(e) => setNewBillName(e.target.value)} disabled={isAddingBill} autoFocus />
                        
                        <label htmlFor="billAmount">Amount* (in {BASE_DB_CURRENCY})</label>
                        <input id="billAmount" type="number" inputMode="decimal" step="0.01" className="amount-input" placeholder="0.00" value={newBillAmount} onChange={(e) => setNewBillAmount(e.target.value)} disabled={isAddingBill} />
                        
                        <label htmlFor="billDueDate">Due Date*</label>
                        <input id="billDueDate" type="date" className="amount-input" value={newBillDueDate} onChange={(e) => setNewBillDueDate(e.target.value)} disabled={isAddingBill} />
                        
                        <label htmlFor="billCategory">Category</label>
                        <input id="billCategory" type="text" className="amount-input" placeholder="e.g., Housing, Subscriptions" value={newBillCategory} onChange={(e) => setNewBillCategory(e.target.value)} disabled={isAddingBill} />
                        
                        {/* Поле Notes и его label УДАЛЕНЫ */}
                        {/* 
                        <label htmlFor="billNotes">Notes</label>
                        <textarea id="billNotes" className="amount-input notes-input" placeholder="Any details..." value={newBillNotes} onChange={(e) => setNewBillNotes(e.target.value)} disabled={isAddingBill} rows="2"></textarea> 
                        */}
                        
                        {addBillError && <p className="error-message-new">{addBillError}</p>}
                        <button className="done-btn-new" onClick={handleAddBillSubmit} disabled={isAddingBill}>
                            {isAddingBill ? 'Adding...' : 'Add Bill'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BillsPage;