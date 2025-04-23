// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
});

// Интерцептор запросов (остается без изменений)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Добавляем токен ко всем запросам, КРОМЕ запросов на /auth/
    if (token && config.url && !config.url.startsWith('/auth/')) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- ИЗМЕНЯЕМ ИНТЕРЦЕПТОР ОТВЕТОВ ---
apiClient.interceptors.response.use(
  (response) => {
    // Если ответ успешный, просто возвращаем его
    return response;
  },
  (error) => {
    // Проверяем, что ошибка связана с ответом сервера И статус равен 401
    if (error.response && error.response.status === 401) {
      // --- Логика автоматического выхода ---
      console.error("Unauthorized! Token might be invalid or expired. Logging out.");

      // 1. Удаляем токен из localStorage
      localStorage.removeItem('token');

      // 2. Перенаправляем на страницу входа
      // Проверяем, что мы еще не на странице входа, чтобы избежать цикла
      if (window.location.pathname !== '/auth') {
          // window.location.href перезагружает страницу, что очищает состояние React.
          // Это самый простой способ, но можно использовать useNavigate из react-router-dom,
          // если у вас настроен глобальный доступ к history или context.
          window.location.href = '/auth?sessionExpired=true'; // Добавим параметр для возможного сообщения
      }
      // --- Конец логики выхода ---

      // Можно не пробрасывать ошибку дальше, если мы обработали ее редиректом,
      // но лучше пробросить, чтобы компонент мог узнать об ошибке (хотя он уже не будет рендериться)
      // return Promise.reject(new Error("Session expired or token invalid. Redirecting to login."));
    }

    // Если это другая ошибка (не 401), пробрасываем ее дальше
    return Promise.reject(error);
  }
);


export default apiClient;

// Экспорт отдельных функций можно оставить или убрать, если не используешь
export const loginUser = (credentials) => apiClient.post('/auth/login', credentials);
export const registerUser = (userData) => apiClient.post('/auth/register', userData);