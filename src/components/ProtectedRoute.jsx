// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import MainLayout from './MainLayout'; // <-- 1. Импортируем MainLayout

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  // 2. Если токен есть, рендерим MainLayout.
  // MainLayout уже содержит <Outlet />, который отобразит
  // нужный дочерний компонент (MainPage, ReportPage и т.д.)
  return <MainLayout />;
};

export default ProtectedRoute;