// src/pages/PlanPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaDonate } from 'react-icons/fa';
import apiClient from '../services/api';
import '../styles/planPage.css';
import '../styles/expenseModal.css'; // Для стилей модалок
import { useCurrency } from '../contexts/CurrencyContext';
import AddFundsToGoalModal from '../components/AddFundsToGoalModal';

function PlanPage() {
    const { formatCurrency, BASE_DB_CURRENCY } = useCurrency();

    const [goals, setGoals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Состояния для модалки добавления новой цели
    const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
    const [isAddingGoal, setIsAddingGoal] = useState(false);
    const [addGoalError, setAddGoalError] = useState(null);
    const [newGoalName, setNewGoalName] = useState('');
    const [newGoalTargetAmount, setNewGoalTargetAmount] = useState('');

    // Состояния для модалки "добавить средства"
    const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
    const [selectedGoalForFunds, setSelectedGoalForFunds] = useState(null);
    const [isSavingFunds, setIsSavingFunds] = useState(false);
    const [addFundsError, setAddFundsError] = useState(null);

    const fetchGoals = useCallback(async () => {
        setIsLoading(true); setError(null);
        try {
            const response = await apiClient.get('/goals', { params: { limit: 100 } });
            if (response.data?.success && Array.isArray(response.data.goals)) {
                setGoals(response.data.goals);
            } else {
                throw new Error('Invalid data received for goals');
            }
        } catch (err) {
            console.error("Failed to fetch goals:", err);
            setError(err.response?.data?.message || err.message || 'Не удалось загрузить цели.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    const handleOpenAddGoalModal = () => {
        setIsAddGoalModalOpen(true);
        setNewGoalName('');
        setNewGoalTargetAmount('');
        setAddGoalError(null);
    };
    const handleCloseAddGoalModal = () => setIsAddGoalModalOpen(false);

    const handleAddGoalSubmit = async () => {
        setAddGoalError(null);
        if (!newGoalName.trim() || !newGoalTargetAmount.trim()) {
            setAddGoalError('Please enter goal name and target amount.'); return;
        }
        const target = parseFloat(newGoalTargetAmount);
        if (isNaN(target) || target <= 0) {
            setAddGoalError('Please enter a valid positive target amount.'); return;
        }
        setIsAddingGoal(true);
        try {
            const newGoalData = { name: newGoalName.trim(), target_amount: target, current_amount: 0 };
            await apiClient.post('/goals', newGoalData);
            handleCloseAddGoalModal();
            fetchGoals(); // Обновляем список целей
        } catch (err) {
            console.error("Failed to add goal:", err);
            setAddGoalError(err.response?.data?.message || err.message || 'Failed to add goal.');
        } finally {
            setIsAddingGoal(false);
        }
    };

    const handleOpenAddFundsModal = (goal) => {
        setSelectedGoalForFunds(goal);
        setAddFundsError(null);
        setIsAddFundsModalOpen(true);
    };

    const handleCloseAddFundsModal = () => {
        setIsAddFundsModalOpen(false);
        setSelectedGoalForFunds(null);
    };

    const handleSaveFundsToGoal = async (amountToAdd) => {
        console.log('PlanPage - handleSaveFundsToGoal: Received amountToAdd from modal:', amountToAdd);
        
        if (!selectedGoalForFunds || !selectedGoalForFunds.id) {
            setAddFundsError("No goal selected.");
            return;
        }
        setIsSavingFunds(true);
        setAddFundsError(null);
        try {
            const response = await apiClient.patch(`/goals/${selectedGoalForFunds.id}/add_funds`, {
                amount: amountToAdd
            });
            if (response.data?.success && response.data.goal) {
                setGoals(prevGoals =>
                    prevGoals.map(g =>
                        g.id === response.data.goal.id ? response.data.goal : g
                    )
                );
                handleCloseAddFundsModal();
            } else {
                throw new Error(response.data?.message || "Failed to add funds to goal.");
            }
        } catch (err) {
            console.error("Failed to add funds to goal:", err);
            setAddFundsError(err.response?.data?.message || err.message || 'Failed to add funds.');
        } finally {
            setIsSavingFunds(false);
        }
    };

    const calculateProgress = (current, target) => {
        if (!target || target <= 0) return 0; // Добавил проверку на !target
        const currentVal = parseFloat(current || 0);
        const targetVal = parseFloat(target);
        const progress = (currentVal / targetVal) * 100;
        return Math.min(progress, 100);
    };
    const renderFormattedAmount = (amount) => formatCurrency(amount);

    return (
        <div className="plan-page-container">
            <div className="plan-content-card">
                <h1 className="plan-title">Add your own financial goals!</h1>
                <button className="add-goal-button" onClick={handleOpenAddGoalModal}> <FaPlus /> Add a goal </button>

                <div className="goals-list">
                    {isLoading && <p className="loading-message">Loading goals...</p>}
                    {!isLoading && error && <p className="error-message">{error}</p>}
                    {!isLoading && !error && (
                        goals.length > 0 ? (
                            goals.map((goal) => (
                                <div key={goal.id} className="goal-item">
                                    <div className="goal-info-container">
                                        <div className="goal-details">
                                            <span className="goal-name">{goal.name}</span>
                                            <span className="goal-amount-text">
                                                {renderFormattedAmount(goal.current_amount)} / {renderFormattedAmount(goal.target_amount)}
                                            </span>
                                        </div>
                                        <button
                                            className="add-funds-to-goal-btn"
                                            onClick={() => handleOpenAddFundsModal(goal)}
                                            title="Add funds to this goal"
                                        >
                                            <FaDonate />
                                        </button>
                                    </div>
                                    <div className="progress-bar-container">
                                        <div className="progress-bar" style={{ width: `${calculateProgress(goal.current_amount, goal.target_amount)}%` }}></div>
                                    </div>
                                </div>
                            ))
                        ) : ( <p className="no-history-message">No goals set yet.</p> )
                    )}
                </div>
            </div>

            {/* Модальное окно добавления новой цели */}
            {isAddGoalModalOpen && (
                <div className="modal-overlay" onClick={handleCloseAddGoalModal}>
                    <div className="modal-content-new" onClick={(e) => e.stopPropagation()}>
                        <h4 className="category-title">New Goal</h4>
                        <input 
                            type="text" 
                            className="amount-input" 
                            placeholder="Enter goal name" 
                            value={newGoalName} 
                            onChange={(e) => setNewGoalName(e.target.value)} 
                            disabled={isAddingGoal} 
                            autoFocus 
                        />
                        <label 
                            htmlFor="goalTargetAmountModal" 
                            style={{fontSize: '0.9em', color: '#666', marginTop:'5px', display:'block'}}
                        >
                            Target Amount (in {BASE_DB_CURRENCY})
                        </label>
                        <input 
                            id="goalTargetAmountModal"
                            type="number" 
                            className="amount-input" 
                            placeholder="Enter target amount" 
                            value={newGoalTargetAmount} 
                            onChange={(e) => setNewGoalTargetAmount(e.target.value)} 
                            disabled={isAddingGoal} 
                            step="0.01"
                            inputMode="decimal"
                        />
                        {addGoalError && <p className="error-message-new">{addGoalError}</p>}
                        <button className="done-btn-new" onClick={handleAddGoalSubmit} disabled={isAddingGoal}>
                            {isAddingGoal ? 'Adding...' : 'Add Goal'}
                        </button>
                    </div>
                </div>
            )}

            {/* НОВОЕ МОДАЛЬНОЕ ОКНО "ДОБАВИТЬ СРЕДСТВА К ЦЕЛИ" */}
            {isAddFundsModalOpen && selectedGoalForFunds && (
                <AddFundsToGoalModal
                    isOpen={isAddFundsModalOpen}
                    onClose={handleCloseAddFundsModal}
                    onSave={handleSaveFundsToGoal}
                    goalName={selectedGoalForFunds.name}
                    isSaving={isSavingFunds}
                    saveError={addFundsError}
                />
            )}
        </div>
    );
}

export default PlanPage;