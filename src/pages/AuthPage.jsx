// src/pages/AuthPage.jsx
import React, { useState } from 'react';
import '../styles/authPage.css'; // Стили для этой страницы
// Можно добавить иконки, если нужно
// import { FiMail, FiLock, FiUser } from 'react-icons/fi';

function AuthPage() {
  // Состояние для переключения режима Вход/Регистрация
  const [isLoginMode, setIsLoginMode] = useState(true);
  // Состояния для полей ввода
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Только для регистрации
  // Состояние для ошибок
  const [error, setError] = useState('');
  // Состояние загрузки (для будущего)
  const [loading, setLoading] = useState(false);

  // Функция переключения режима
  const switchModeHandler = () => {
    setIsLoginMode((prevMode) => !prevMode);
    setError(''); // Сбрасываем ошибку при переключении
    // Сбрасываем поля при переключении для чистоты
    setEmail('');
    setPassword('');
    setName('');
  };

  // Обработчик отправки формы
  const submitHandler = (event) => {
    event.preventDefault(); // Предотвращаем перезагрузку страницы
    setError(''); // Сброс предыдущей ошибки
    setLoading(true); // Показываем загрузку (в будущем)

    // Базовая валидация
    if (!email.includes('@') || password.length < 6) {
      setError('Invalid email or password (must be at least 6 chars).');
      setLoading(false);
      return;
    }
    if (!isLoginMode && name.trim().length === 0) {
      setError('Please enter your name for registration.');
      setLoading(false);
      return;
    }

    // --- Логика для БУДУЩЕГО БЭКЕНДА ---
    if (isLoginMode) {
      console.log('Logging in:', { email, password });
      // TODO: Отправить запрос на /api/auth/login
      // fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }), ... })
    } else {
      console.log('Registering:', { name, email, password });
      // TODO: Отправить запрос на /api/auth/register
      // fetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }), ... })
    }
    // ---- Конец логики для бэкенда ----

    // Имитация запроса (удалить позже)
    setTimeout(() => {
        console.log("Request finished");
        setLoading(false);
        // setError('Login/Registration failed (placeholder)'); // Пример ошибки
    }, 1500);
  };

  return (
    <div className="auth-page-container"> {/* Контейнер всей страницы */}
      <div className="auth-form-card">    {/* "Карточка" формы */}
        <h1>{isLoginMode ? 'Login' : 'Register'}</h1>

        <form onSubmit={submitHandler}>
          {/* Поле Name (только для регистрации) */}
          {!isLoginMode && (
            <div className="input-box">
              {/* <FiUser className="input-icon" /> */}
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required // Делает поле обязательным, помогает CSS :valid
              />
              <label htmlFor="name">Name</label>
            </div>
          )}

          {/* Поле Email */}
          <div className="input-box">
            {/* <FiMail className="input-icon" /> */}
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="email">Email</label>
          </div>

          {/* Поле Password */}
          <div className="input-box">
            {/* <FiLock className="input-icon" /> */}
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6} // Валидация на мин. длину
            />
            <label htmlFor="password">Password</label>
          </div>

          {/* Отображение ошибки */}
          {error && <p className="error-message">{error}</p>}

          {/* Кнопка Submit */}
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Sending...' : (isLoginMode ? 'Login' : 'Create Account')}
          </button>

          {/* Ссылка для переключения режима */}
          <p className="switch-mode-text">
            {isLoginMode ? "Don't have an account?" : 'Already have an account?'}
            <button type="button" onClick={switchModeHandler} className="switch-mode-button">
              {isLoginMode ? 'Register' : 'Login'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;