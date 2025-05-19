// src/contexts/CurrencyContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
// apiClient здесь больше не нужен для загрузки курсов или обновления предпочтений на бэке (если это не часть user/profile)

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

// Оставляем поддерживаемые валюты для UI настроек, но конвертации не будет
export const SUPPORTED_CURRENCIES = {
  BYN: 'BYN',
  USD: 'USD',
  EUR: 'EUR',
  RUB: 'RUB',
};

export const BASE_DB_CURRENCY = 'BYN'; // Это наша единственная рабочая валюта сейчас

export const CurrencyProvider = ({ children }) => {
  // selectedCurrency будет хранить выбор пользователя из настроек,
  // но formatCurrency будет его игнорировать и всегда использовать BYN
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    const storedCurrency = localStorage.getItem('selectedDisplayCurrency');
    console.log(`CurrencyContext (useState init - BYN ONLY): Initializing selectedCurrency from localStorage. Found: '${storedCurrency}'. Using: '${storedCurrency || BASE_DB_CURRENCY}'`);
    return storedCurrency || BASE_DB_CURRENCY;
  });

  // Курсы и их загрузка больше не нужны
  // const [exchangeRates, setExchangeRates] = useState({ [BASE_DB_CURRENCY]: 1 });
  // const [loadingRates, setLoadingRates] = useState(true);

  useEffect(() => {
    localStorage.setItem('selectedDisplayCurrency', selectedCurrency);
    console.log(`CurrencyContext (useEffect [selectedCurrency] - BYN ONLY): selectedCurrency changed to '${selectedCurrency}' and saved to localStorage (no conversion will happen).`);
  }, [selectedCurrency]);

  // Функция formatCurrency теперь всегда форматирует в BASE_DB_CURRENCY (BYN)
  const formatCurrency = useCallback((amountInBaseCurrency, options = {}) => {
    console.log(`CurrencyContext (formatCurrency - BYN ONLY): Called. Amount: ${amountInBaseCurrency}. Formatting as BYN.`);
    
    if (typeof amountInBaseCurrency === 'undefined' || amountInBaseCurrency === null) {
        return "";
    }
    const numericValue = parseFloat(amountInBaseCurrency);
    if (isNaN(numericValue)) {
        return "";
    }

    try {
        // Всегда используем BASE_DB_CURRENCY для форматирования
        return new Intl.NumberFormat(undefined, { 
            style: 'currency',
            currency: BASE_DB_CURRENCY, // Явно указываем BYN
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            ...options,
        }).format(numericValue);
    } catch (e) {
      console.warn(`CurrencyContext (formatCurrency - BYN ONLY): Intl.NumberFormat error for currency ${BASE_DB_CURRENCY}. Error:`, e);
      // Фоллбэк на простое отображение для BYN
      return `${numericValue.toFixed(2)} ${BASE_DB_CURRENCY}`;
    }
  }, []); // Зависимостей, связанных с курсами, больше нет

  const handleSetSelectedCurrency = (newCurrency) => {
    console.log(`CurrencyContext (handleSetSelectedCurrency - BYN ONLY): Received new currency '${newCurrency}'. Updating state (for UI consistency).`);
    setSelectedCurrency(newCurrency);
  };

  // convertAmount и updateUserCurrencyPreference можно пока убрать из value, если они не нужны
  // Оставляем SUPPORTED_CURRENCIES и BASE_DB_CURRENCY для консистентности, если они где-то используются
  return (
    <CurrencyContext.Provider value={{
        selectedCurrency, // Выбранная пользователем (для UI настроек)
        setSelectedCurrency: handleSetSelectedCurrency,
        formatCurrency,     // Форматирует ТОЛЬКО в BYN
        // exchangeRates: {}, // Больше не нужны
        // loadingRates: false, // Больше не нужны
        // convertAmount: (amount) => parseFloat(amount), // Заглушка, если где-то используется
        SUPPORTED_CURRENCIES, // Для селекта в настройках
        BASE_DB_CURRENCY      // Наша основная валюта
        // updateUserCurrencyPreference: async () => {} // Заглушка, если где-то используется
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};