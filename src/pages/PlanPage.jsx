// src/pages/PlanPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus } from 'react-icons/fa';
import apiClient from '../services/api';
import '../styles/planPage.css';
import '../styles/expenseModal.css';
// --- ДОБАВЛЯЕМ ИМПОРТ ХЕЛПЕРА ---
import { formatCurrency } from '../utils/formatting';

function PlanPage() {
    const [goals, setGoals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddingGoal, setIsAddingGoal] = useState(false);
    const [addGoalError, setAddGoalError] = useState(null);
    const [newGoalName, setNewGoalName] = useState('');
    const [newGoalTargetAmount, setNewGoalTargetAmount] = useState('');

    const fetchGoals = useCallback(async () => {
        setIsLoading(true); setError(null); setGoals([]);
        try {
            const response = await apiClient.get('/goals', { params: { limit: 100 } });
            if (response.data?.success && Array.isArray(response.data.goals)) { setGoals(response.data.goals); }
            else { throw new Error('Invalid data received for goals'); }
        } catch (err) { console.error("Failed to fetch goals:", err); setError(err.response?.data?.message || err.message || 'Не удалось загрузить цели.'); }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { fetchGoals(); }, [fetchGoals]);

    const handleOpenModal = () => { setIsModalOpen(true); setNewGoalName(''); setNewGoalTargetAmount(''); setAddGoalError(null); };
    const handleCloseModal = () => setIsModalOpen(false);
    const handleAddGoalSubmit = async () => {
        setAddGoalError(null);
        if (!newGoalName.trim() || !newGoalTargetAmount.trim()) { setAddGoalError('Please enter goal name and target amount.'); return; }
        const target = parseFloat(newGoalTargetAmount); if (isNaN(target) || target <= 0) { setAddGoalError('Please enter a valid positive target amount.'); return; }
        setIsAddingGoal(true);
        try {
            const newGoalData = { name: newGoalName.trim(), target_amount: target };
            await apiClient.post('/goals', newGoalData); handleCloseModal(); fetchGoals();
        } catch (err) { console.error("Failed to add goal:", err); setAddGoalError(err.response?.data?.message || err.message || 'Failed to add goal.'); }
        finally { setIsAddingGoal(false); }
    };

    const calculateProgress = (current, target) => {
        if (target <= 0) return 0;
        const currentVal = parseFloat(current || 0); const targetVal = parseFloat(target);
        const progress = (currentVal / targetVal) * 100; return Math.min(progress, 100);
    };

    return (
        <div className="plan-page-container">
            <div className="plan-content-card">
                <h1 className="plan-title">Add your own financial goals!</h1>
                <button className="add-goal-button" onClick={handleOpenModal}> <FaPlus /> Add a goal </button>

                <div className="goals-list">
                    {isLoading && <p className="loading-message">Loading goals...</p>}
                    {!isLoading && error && <p className="error-message">{error}</p>}
                    {!isLoading && !error && (
                        goals.length > 0 ? (
                            goals.map((goal) => (
                                <div key={goal.id} className="goal-item">
                                    <div className="goal-details">
                                        <span className="goal-name">{goal.name}</span>
                                        <span className="goal-amount-text">
                                            {/* --- ИСПОЛЬЗУЕМ ХЕЛПЕР --- */}
                                            {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                                        </span>
                                    </div>
                                    <div className="progress-bar-container"> <div className="progress-bar" style={{ width: `${calculateProgress(goal.current_amount, goal.target_amount)}%` }} ></div> </div>
                                </div>
                            ))
                        ) : ( <p className="no-history-message">No goals set yet.</p> ) // Используем no-history-message класс
                    )}
                </div>
            </div>

            {/* Модальное окно */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content-new" onClick={(e) => e.stopPropagation()}>
                        <h4 className="category-title">New Goal</h4>
                        <input type="text" className="amount-input" placeholder="Enter goal name" value={newGoalName} onChange={(e) => setNewGoalName(e.target.value)} disabled={isAddingGoal} autoFocus />
                        <input type="number" className="amount-input" placeholder="Enter target amount" value={newGoalTargetAmount} onChange={(e) => setNewGoalTargetAmount(e.target.value)} disabled={isAddingGoal} />
                        {addGoalError && <p className="error-message-new">{addGoalError}</p>}
                        <button className="done-btn-new" onClick={handleAddGoalSubmit} disabled={isAddingGoal}> {isAddingGoal ? 'Adding...' : 'Add Goal'} </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PlanPage;