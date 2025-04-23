// src/pages/AuthPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Импортируем useNavigate
import apiClient from '../services/api'; // 1. Импортируем наш apiClient
import '../styles/authPage.css';

// Можно добавить иконки, если нужно
// import { FiMail, FiLock, FiUser } from 'react-icons/fi';

function AuthPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // 2. Получаем функцию навигации

  const switchModeHandler = () => {
    setIsLoginMode((prevMode) => !prevMode);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  // 3. Модифицируем submitHandler
  const submitHandler = async (event) => { // Делаем функцию async
    event.preventDefault();
    setError(''); // Сброс ошибки перед новым запросом
    setLoading(true);

    // Базовая валидация (оставляем как есть)
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

    try {
      let response;
      if (isLoginMode) {
        // --- Логин ---
        console.log('Attempting login:', { email, password });
        response = await apiClient.post('/auth/login', {
          email,
          password,
        });
        console.log('Login successful:', response.data);
      } else {
        // --- Регистрация ---
        console.log('Attempting registration:', { name, email, password });
        response = await apiClient.post('/auth/register', {
          name, // Убедись, что твой бэкенд ожидает поле 'name'
          email,
          password,
        });
        console.log('Registration successful:', response.data);
         // Возможно, после успешной регистрации, стоит сразу переключить на логин
         // или если бэкенд возвращает токен при регистрации, можно сразу залогинить
      }

      // --- Обработка УСПЕШНОГО ответа (и для логина, и для регистрации, если она возвращает токен) ---
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token); // Сохраняем токен
        // Перенаправляем на главную страницу (укажи правильный путь, например '/menu' или '/')
        navigate('/', { replace: true }); // replace: true - чтобы нельзя было вернуться назад на страницу логина
      } else {
         // Если регистрация не вернула токен, можно просто переключить на логин
         if (!isLoginMode) {
            console.log('Registration successful, please login.');
            setIsLoginMode(true); // Переключаем на форму логина
            setError('Registration successful! Please log in.'); // Даем фидбек
            // Очищаем поля формы регистрации
            setName('');
            setEmail(''); // Можно оставить email, если хотим удобства
            setPassword('');
         } else {
             // Неожиданный ответ от сервера при логине (без токена)
             throw new Error('Authentication failed: No token received.');
         }
      }

    } catch (err) {
      // --- Обработка ОШИБКИ ---
      console.error('Authentication error:', err.response || err.message || err);
      // Пытаемся получить сообщение об ошибке от бэкенда, иначе показываем общее сообщение
      const errorMessage = err.response?.data?.message || // Ошибка от нашего API
                         err.message || // Общая ошибка (напр. сетевая)
                         'Authentication failed. Please check your details or try again later.';
      setError(errorMessage);
    } finally {
      // --- Выполняется всегда (после try или catch) ---
      setLoading(false); // Убираем индикатор загрузки
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-form-card">
        <h1>{isLoginMode ? 'Login' : 'Register'}</h1>
        <form onSubmit={submitHandler}>
          {!isLoginMode && (
            <div className="input-box">
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading} // Блокируем поля во время загрузки
              />
              <label htmlFor="name">Name</label>
            </div>
          )}
          <div className="input-box">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading} // Блокируем поля во время загрузки
            />
            <label htmlFor="email">Email</label>
          </div>
          <div className="input-box">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading} // Блокируем поля во время загрузки
            />
            <label htmlFor="password">Password</label>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Processing...' : (isLoginMode ? 'Login' : 'Create Account')}
          </button>

          <p className="switch-mode-text">
            {isLoginMode ? "Don't have an account?" : 'Already have an account?'}
            <button
              type="button"
              onClick={switchModeHandler}
              className="switch-mode-button"
              disabled={loading} // Блокируем переключение во время загрузки
            >
              {isLoginMode ? 'Register' : 'Login'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;