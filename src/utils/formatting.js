// src/utils/formatting.js

/**
 * Форматирует число как денежную сумму с использованием валюты из localStorage.
 * @param {number|string|null|undefined} amount - Сумма для форматирования.
 * @param {object} options - Дополнительные опции.
 * @param {string} [options.currencyCode=localStorage or 'BYN'] - Принудительно использовать этот код валюты (USD, EUR, BYN).
 * @returns {string} Отформатированная строка (напр., "€ 123.45", "$ 50.00", "100.00 BYN").
 */
export const formatCurrency = (amount, options = {}) => {
    const defaultCurrency = 'BYN'; // Валюта по умолчанию
    // Читаем сохраненную валюту ИЛИ берем опцию ИЛИ берем дефолт
    const storedCurrency = localStorage.getItem('userCurrency') || defaultCurrency;
    const displayCurrency = options.currencyCode || storedCurrency;

    // Определяем символ и параметры форматирования
    let symbol = 'BYN';
    let locale = 'ru-RU'; // Локаль для форматирования (влияет на разделители и позицию символа)

    if (displayCurrency === 'USD') {
        symbol = '$';
        locale = 'en-US'; // Для $ символ обычно слева
    } else if (displayCurrency === 'EUR') {
        symbol = '€';
        locale = 'de-DE'; // Для € символ часто справа (или зависит от языка)
    }
    // Для BYN оставляем locale 'ru-RU', символ будет справа

    const numericAmount = parseFloat(amount);

    // Если сумма невалидна, возвращаем "0" с правильной валютой
    if (isNaN(numericAmount)) {
        try {
             return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: displayCurrency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
             }).format(0);
         } catch (e) {
             // Fallback если Intl не сработал
             return `0.00 ${symbol}`; // Используем символ как запасной вариант
         }
    }

    // Используем Intl.NumberFormat для правильного форматирования
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: displayCurrency, // Важно передать КОД (USD, EUR, BYN)
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numericAmount);
    } catch (e) {
        // Fallback, если Intl не смог обработать код валюты
        console.error("Intl.NumberFormat failed:", e);
        // Вернем просто с символом
        return `${symbol} ${numericAmount.toFixed(2)}`;
    }
};