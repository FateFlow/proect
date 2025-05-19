// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/global.css';
// --- ИМПОРТ CurrencyProvider ---
import { CurrencyProvider } from './contexts/CurrencyContext';
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
        // --- ОБЕРТКА CurrencyProvider ---
        <CurrencyProvider>
            <Router>
                {/* Внешние div'ы больше не нужны здесь, они теперь в MainLayout */}
                <Routes>
                    {/* --- Публичный Маршрут --- */}
                    <Route path="/auth" element={<AuthPage />} />

                    {/* --- Защищенные Маршруты --- */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<MainPage />} />
                        <Route path="/report" element={<ReportPage />} />
                        <Route path="/account" element={<AccountPage />} />
                        {/* ИСПРАВЛЕНИЕ ЗДЕСЬ: */}
                        <Route path="/plan" element={<PlanPage />} /> {/* Было: <Route path="/plan"={<PlanPage />} /> */}
                        <Route path="/bills" element={<BillsPage />} />
                        <Route path="/history" element={<HistoryPage />} />
                    </Route>
                </Routes>
            </Router>
        </CurrencyProvider>
    );
}

export default App;