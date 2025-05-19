-- Файл: backend/db/schema.sql

-- Таблица Пользователи (Users)
CREATE TABLE IF NOT EXISTS Users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Храним хеш пароля, не сам пароль!
    name VARCHAR(100),
    phone VARCHAR(20),
    currency VARCHAR(3) NOT NULL DEFAULT 'BYN', -- Изменил на RUB, как более вероятно для РФ, можешь поменять на BYN или оставить
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска по email (важно для логина)
CREATE INDEX IF NOT EXISTS idx_users_email ON Users(email);

-- Таблица Транзакции (Transactions)
-- Зависит от Users, поэтому создаем после Users
CREATE TABLE IF NOT EXISTS Transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE, -- Внешний ключ на Users
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')), -- Тип: доход или расход
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0), -- Сумма (положительная)
    category VARCHAR(100) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL, -- Дата и время транзакции
    notes TEXT, -- Дополнительные заметки
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    -- updated_at здесь может быть не нужен, т.к. транзакции обычно не меняются, но можно добавить при необходимости
);

-- Индексы для транзакций (ускоряют выборку по пользователю и дате)
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON Transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON Transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON Transactions(user_id, date); -- Комбинированный индекс

-- Таблица Счета/Регулярные платежи (Bills)
-- Зависит от Users
CREATE TABLE IF NOT EXISTS Bills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    due_date DATE NOT NULL, -- Дата, до которой оплатить (только дата, без времени)
    period VARCHAR(10) NOT NULL CHECK (period IN ('month', 'week', 'year', 'once')), -- Периодичность ('once' для разовых)
    paid BOOLEAN NOT NULL DEFAULT FALSE, -- Оплачен ли счет в текущем периоде
    category VARCHAR(100), -- Категория, к которой относится счет
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для счетов
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON Bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON Bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_user_due_date ON Bills(user_id, due_date);

-- Таблица Финансовые цели (Goals)
-- Зависит от Users
CREATE TABLE IF NOT EXISTS Goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    target_amount DECIMAL(12, 2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    deadline DATE, -- Крайний срок (опционально)
    icon VARCHAR(50), -- Название иконки (опционально)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для целей
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON Goals(user_id);

-- Примечание: Функции для автоматического обновления updated_at можно добавить позже триггерами,
-- пока оставим так для простоты.