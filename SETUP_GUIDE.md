# Руководство по настройке и запуску AI Integration Frontend

## Быстрый старт

### 1. Установка зависимостей

```bash
cd E:\1_MyProjects\Ai-integration-front\ai-integration-front
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
VITE_API_URL=http://localhost:8091
```

### 3. Запуск бекенда

Сначала запустите бекенд-сервис:

```bash
cd E:\1_MyProjects\AltaProject (AltaTrack)\noteapp-ai-integration
.\gradlew bootRun
```

Бекенд будет доступен на `http://localhost:8091`

### 4. Запуск фронтенда

```bash
cd E:\1_MyProjects\Ai-integration-front\ai-integration-front
npm run dev
```

Фронтенд откроется на `http://localhost:3000`

### 5. Вход в систему

1. Откройте Swagger UI бекенда: http://localhost:8091/swagger-ui.html
2. Используйте endpoint `POST /api/auth/register` для создания админа:
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```
3. Войдите в админ-панель фронтенда с этими credentials

## Структура проектов

```
E:\1_MyProjects\
├── AltaProject (AltaTrack)\
│   └── noteapp-ai-integration\     # Бекенд (Spring Boot)
│       ├── src\
│       ├── build.gradle.kts
│       └── ...
│
└── Ai-integration-front\
    └── ai-integration-front\        # Фронтенд (React + Vite)
        ├── src\
        ├── package.json
        └── ...
```

## Разработка

### Горячая перезагрузка

Оба сервиса поддерживают hot reload:
- **Бекенд**: Spring Boot DevTools автоматически перезагружает изменения
- **Фронтенд**: Vite HMR обновляет страницу при изменении файлов

### Проверка подключения

1. Откройте фронтенд: http://localhost:3000
2. Войдите в систему
3. Перейдите на вкладку "🧪 Тесты"
4. Нажмите "Запустить все тесты"

Все тесты должны пройти успешно ✅

## Production сборка

### Фронтенд

```bash
cd E:\1_MyProjects\Ai-integration-front\ai-integration-front
npm run build
```

Собранные файлы будут в `dist/`

### Docker

```bash
# Сборка образа
docker build -t ai-integration-frontend .

# Запуск
docker run -d -p 3000:80 ai-integration-frontend
```

## Troubleshooting

### Ошибка "Failed to fetch"

**Проблема**: Фронтенд не может подключиться к бекенду

**Решение**:
1. Проверьте, что бекенд запущен: http://localhost:8091/actuator/health
2. Проверьте `VITE_API_URL` в `.env`
3. Перезапустите фронтенд после изменения `.env`

### CORS ошибки

**Проблема**: Браузер блокирует запросы

**Решение**: CORS уже настроен в `SecurityConfig.java` бекенда. Если проблема сохраняется:
1. Проверьте консоль браузера
2. Убедитесь, что бекенд возвращает правильные CORS headers
3. Очистите кэш браузера

### Ошибка 401 Unauthorized

**Проблема**: Токен истек или невалиден

**Решение**:
1. Выйдите из системы (кнопка "Выйти")
2. Войдите заново
3. Токен сохраняется в `localStorage` с ключом `ai_admin_token`

### Порт 3000 занят

**Решение**: Измените порт в `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, // Измените на свободный порт
    // ...
  }
})
```

## Полезные команды

### Фронтенд

```bash
# Разработка
npm run dev

# Сборка
npm run build

# Предпросмотр сборки
npm run preview

# Линтинг
npm run lint
```

### Бекенд

```bash
# Запуск
.\gradlew bootRun

# Сборка
.\gradlew build

# Тесты
.\gradlew test

# Очистка
.\gradlew clean
```

## API Documentation

Swagger UI бекенда: http://localhost:8091/swagger-ui.html

Основные endpoints:
- **Auth**: `/api/auth/login`, `/api/auth/register`
- **Networks**: `/api/admin/networks`
- **Clients**: `/api/admin/clients`
- **Access**: `/api/admin/access`
- **Logs**: `/api/admin/logs`
- **Stats**: `/api/admin/stats`

## Следующие шаги

1. ✅ Фронтенд перенесен в отдельный сервис
2. ✅ Все компоненты скопированы
3. ✅ Конфигурация настроена
4. ✅ Docker поддержка добавлена
5. ⏳ Удалить папку `frontend` из бекенда (после тестирования)

## Контакты и поддержка

При возникновении проблем:
1. Проверьте логи бекенда
2. Проверьте консоль браузера (F12)
3. Проверьте Network tab в DevTools

