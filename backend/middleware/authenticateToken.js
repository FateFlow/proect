// Файл: backend/middleware/authenticateToken.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  // 1. Получаем токен из заголовка Authorization
  // Формат заголовка: "Bearer TOKEN_STRING"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Извлекаем сам токен

  // 2. Если токена нет
  if (token == null) {
    return res.status(401).json({ success: false, message: 'Требуется токен аутентификации' }); // Unauthorized
  }

  // 3. Проверяем токен
  const secret = process.env.JWT_SECRET;
  if (!secret) {
      console.error("Критическая ошибка: Секретный ключ JWT не установлен в .env для проверки!");
      return res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера (JWT Secret Missing)' });
  }

  // Файл: backend/middleware/authenticateToken.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ success: false, message: 'Требуется токен аутентификации' });
  }

  // --- ДОБАВЬ ЭТУ ПРОВЕРКУ ---
  const secret = process.env.JWT_SECRET;
  if (!secret) {
      console.error("Критическая ошибка: Секретный ключ JWT не установлен в .env для проверки!");
      // В реальном приложении здесь лучше не раскрывать детали, но для отладки можно
      return res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера (JWT Secret Missing)' });
  }
  // --- КОНЕЦ ПРОВЕРКИ ---


  // Теперь secret точно не undefined
  jwt.verify(token, secret, (err, payload) => {
    // ... (остальной код без изменений) ...
  });
}

module.exports = authenticateToken;
  jwt.verify(token, secret, (err, payload) => {
    // 4. Если токен невалидный (ошибка верификации или истек срок)
    if (err) {
      console.log('Ошибка верификации токена:', err.message); // Логируем ошибку для отладки
      // Отправляем разные статусы в зависимости от ошибки
      if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ success: false, message: 'Токен истек' });
      }
      // Для других ошибок (неверная подпись и т.д.) тоже 403 Forbidden или 401 Unauthorized
      return res.status(403).json({ success: false, message: 'Невалидный токен' }); // Forbidden
    }

    // 5. Токен валидный! Добавляем payload (данные пользователя из токена) к объекту запроса
    // Теперь в следующих обработчиках можно будет получить req.user
    req.user = payload;
    // console.log('Токен успешно верифицирован, payload:', payload); // Для отладки

    // 6. Передаем управление следующему обработчику в цепочке
    next();
  });
}

module.exports = authenticateToken; // Экспортируем middleware