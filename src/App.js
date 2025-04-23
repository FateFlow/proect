// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/global.css';
// Импорты страниц остаются
import MainPage from './pages/MainPage';
import AccountPage from './pages/AccountPage';
import HistoryPage from './pages/HistoryPage';
import ReportPage from './pages/ReportPage';
import PlanPage from './pages/PlanPage';
import BillsPage from './pages/BillsPage';
import AuthPage from './pages/AuthPage.jsx';
// Импорт ProtectedRoute остается
import ProtectedRoute from './components/ProtectedRoute';
// NavigationBar и MainLayout больше не нужны здесь

function App() {
    return (
        <Router>
            {/* Внешние div'ы больше не нужны здесь, они теперь в MainLayout */}
            <Routes>
                {/* --- Публичный Маршрут --- */}
                {/* На этом маршруте НЕ будет NavigationBar, т.к. он не использует MainLayout */}
                <Route path="/auth" element={<AuthPage />} />

                {/* --- Защищенные Маршруты --- */}
                {/* Этот маршрут использует ProtectedRoute в качестве элемента. */}
                {/* ProtectedRoute решает: показать MainLayout (с Outlet и NavigationBar) или редирект на /auth */}
                <Route element={<ProtectedRoute />}>
                    {/* Outlet внутри MainLayout будет рендерить эти дочерние маршруты */}
                    <Route path="/" element={<MainPage />} />
                    <Route path="/report" element={<ReportPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/plan" element={<PlanPage />} />
                    <Route path="/bills" element={<BillsPage />} />
                    <Route path="/history" element={<HistoryPage />} />
                    {/* Другие защищенные маршруты */}
                </Route>

                {/* Опционально: Маршрут 404 Not Found */}
                {/* <Route path="*" element={<div>Страница не найдена</div>} /> */}
            </Routes>
        </Router>
    );
}

export default App;