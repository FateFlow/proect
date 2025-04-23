// src/components/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import NavigationBar from './NavigationBar'; // Убедись, что путь верный
import '../styles/global.css'; // Подключаем глобальные стили, если нужно

const MainLayout = () => {
  return (
    // Этот div имитирует структуру, которая раньше была в App.js
    // Он обеспечивает общий контейнер и место для основного контента + навигации
    <div className="app-container">
      <main className="main-content">
        {/* <Outlet /> - это специальный компонент react-router-dom,
            который будет рендерить дочерний маршрут
            (например, MainPage, ReportPage и т.д.) */}
        <Outlet />
      </main>
      {/* NavigationBar теперь является частью этого макета */}
      <NavigationBar />
    </div>
  );
};

export default MainLayout;