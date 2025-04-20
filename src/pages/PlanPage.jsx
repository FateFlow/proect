import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa'; // Иконка плюса для кнопки
import '../styles/planPage.css';    // Стили для этой страницы
import '../styles/expenseModal.css'; // Используем стили для модалки

// --- Пример данных для целей ---
const sampleGoals = [
  { id: 1, name: 'New PC', currentAmount: 300, targetAmount: 1000 },
  { id: 2, name: 'Present for Mike', currentAmount: 23, targetAmount: 100 },
];
// --- Конец примера данных ---

function PlanPage() {
  // Состояние для списка целей
  const [goals, setGoals] = useState(sampleGoals);
  // Состояние для модального окна
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Состояния для полей ввода в модалке
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTargetAmount, setNewGoalTargetAmount] = useState('');
  // Состояние для ошибки в модалке
  const [modalError, setModalError] = useState('');

  // Открыть модальное окно
  const handleOpenModal = () => {
    setIsModalOpen(true);
    setNewGoalName(''); // Сброс полей
    setNewGoalTargetAmount('');
    setModalError('');    // Сброс ошибки
  };

  // Закрыть модальное окно
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Добавить новую цель
  const handleAddGoal = () => {
    setModalError(''); // Сброс ошибки

    // Валидация
    if (!newGoalName.trim() || !newGoalTargetAmount.trim()) {
      setModalError('Please enter goal name and target amount.');
      return;
    }
    const target = parseFloat(newGoalTargetAmount);
    if (isNaN(target) || target <= 0) {
      setModalError('Please enter a valid positive target amount.');
      return;
    }

    // Создание объекта цели
    const newGoal = {
      id: Date.now(), // Простой ID
      name: newGoalName.trim(),
      currentAmount: 0, // Новая цель начинается с 0 накоплений
      targetAmount: target,
    };

    // Обновление списка целей
    setGoals(prevGoals => [...prevGoals, newGoal]);

    // Закрытие окна
    handleCloseModal();
  };

  // Расчет прогресса в %
  const calculateProgress = (current, target) => {
    if (target <= 0) return 0; // Избегаем деления на ноль
    const progress = (current / target) * 100;
    return Math.min(progress, 100); // Не больше 100%
  };

  return (
    <div className="plan-page-container"> {/* Основной контейнер с зеленым фоном */}
      <div className="plan-content-card">   {/* Белая карточка */}

        <h1 className="plan-title">Add your own financial goals!</h1>

        <button className="add-goal-button" onClick={handleOpenModal}>
          <FaPlus /> Add a goal
        </button>

        <div className="goals-list">
          {goals.map((goal) => (
            <div key={goal.id} className="goal-item">
              <div className="goal-details">
                <span className="goal-name">{goal.name}</span>
                <span className="goal-amount-text">
                   {goal.currentAmount.toFixed(0)}$ / {goal.targetAmount.toFixed(0)}$ {/* Форматируем суммы */}
                </span>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{ width: `${calculateProgress(goal.currentAmount, goal.targetAmount)}%` }} // Динамическая ширина
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Можно показывать всегда или только когда goals.length === 0 */}
        <p className="future-goals-placeholder">Space for your future goals...</p>

      </div>

      {/* --- Модальное окно добавления цели --- */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content-new" onClick={(e) => e.stopPropagation()}>

            <h4 className="category-title">New Goal</h4> {/* Используем существующий стиль */}

            {/* Поле ввода названия цели */}
            <input
              type="text"
              className="amount-input" // Используем стиль amount-input
              placeholder="Enter goal name"
              value={newGoalName}
              onChange={(e) => setNewGoalName(e.target.value)}
              autoFocus
            />

            {/* Поле ввода целевой суммы */}
            <input
              type="number"
              className="amount-input" // Используем стиль amount-input
              placeholder="Enter target amount"
              value={newGoalTargetAmount}
              onChange={(e) => setNewGoalTargetAmount(e.target.value)}
            />

            {/* Отображение ошибки */}
            {modalError && <p className="error-message-new">{modalError}</p>}

            {/* Кнопка Done */}
            <button className="done-btn-new" onClick={handleAddGoal}>
              Add Goal
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

export default PlanPage;