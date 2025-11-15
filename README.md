# AI Integration Frontend

Фронтенд-приложение для управления AI Integration Service - админ-панель для управления нейросетями, клиентами и мониторинга запросов.

## Технологии

- **React 19** - UI библиотека
- **TypeScript** - типизация
- **Vite** - сборщик и dev-сервер
- **Tailwind CSS** - стилизация
- **Axios** - HTTP клиент

## Требования

- Node.js 18+ 
- npm или yarn

## Установка

```bash
# Установка зависимостей
npm install

# Создайте файл .env (скопируйте из .env.example)
cp .env.example .env
```

## Конфигурация

Отредактируйте файл `.env`:

```env
# URL бекенд API
VITE_API_URL=http://localhost:8091
```

## Запуск для разработки

```bash
# Запуск dev-сервера на http://localhost:3000
npm run dev
```

Приложение автоматически откроется в браузере. Hot reload включен.

## Сборка для продакшена

```bash
# Сборка оптимизированной версии
npm run build

# Предпросмотр production сборки
npm run preview
```

Собранные файлы будут в папке `dist/`.

## Docker

### Сборка образа

```bash
# Сборка с дефолтным API URL
docker build -t ai-integration-frontend .

# Сборка с кастомным API URL
docker build --build-arg VITE_API_URL=https://api.example.com -t ai-integration-frontend .
```

### Запуск контейнера

```bash
docker run -d -p 3000:80 --name ai-frontend ai-integration-frontend
```

Приложение будет доступно на `http://localhost:3000`

## Структура проекта

```
src/
├── components/          # React компоненты
│   ├── Login.tsx       # Страница входа
│   ├── Dashboard.tsx   # Главная панель
│   ├── NetworksManager.tsx        # Управление нейросетями
│   ├── ClientsManager.tsx         # Управление клиентами
│   ├── NetworkAccessManager.tsx   # Управление доступами
│   ├── NetworkAccessTests.tsx     # Тесты API
│   ├── LogsViewer.tsx            # Просмотр логов
│   └── StatsPanel.tsx            # Статистика
├── api.ts              # API клиент
├── types.ts            # TypeScript типы
├── App.tsx             # Корневой компонент
├── main.tsx            # Entry point
├── index.css           # Глобальные стили
└── App.css             # Стили приложения
```

## Основные функции

### 🔐 Аутентификация
- Вход через JWT токен
- Автоматическое сохранение сессии
- Защита роутов

### 🧠 Управление нейросетями
- Добавление/редактирование/удаление нейросетей
- Поддержка различных провайдеров (OpenAI, Yandex, Anthropic, Mistral, Sber, Whisper)
- Настройка приоритетов и лимитов
- Примеры запросов для каждого провайдера

### 🔑 Управление клиентами
- Создание клиентских приложений
- Генерация и регенерация API ключей
- Активация/деактивация клиентов

### 🔗 Управление доступами
- Предоставление доступа клиентам к нейросетям
- Настройка дневных и месячных лимитов
- Отзыв доступа

### 📊 Мониторинг
- Статистика использования
- Просмотр логов запросов
- Фильтрация по клиентам и нейросетям

### 🧪 Тестирование
- Встроенные тесты API
- Проверка всех endpoint'ов
- Детальные результаты тестов

## API Endpoints

Приложение взаимодействует со следующими endpoint'ами бекенда:

- `POST /api/auth/login` - Вход
- `GET /api/admin/networks` - Список нейросетей
- `POST /api/admin/networks` - Создание нейросети
- `PUT /api/admin/networks/{id}` - Обновление нейросети
- `DELETE /api/admin/networks/{id}` - Удаление нейросети
- `GET /api/admin/clients` - Список клиентов
- `POST /api/admin/clients` - Создание клиента
- `PUT /api/admin/clients/{id}` - Обновление клиента
- `DELETE /api/admin/clients/{id}` - Удаление клиента
- `POST /api/admin/clients/{id}/regenerate-key` - Регенерация API ключа
- `GET /api/admin/access` - Список доступов
- `POST /api/admin/access` - Предоставление доступа
- `DELETE /api/admin/access/{id}` - Отзыв доступа
- `GET /api/admin/logs` - Логи запросов
- `GET /api/admin/stats` - Статистика

## Разработка

### Линтинг

```bash
npm run lint
```

### Форматирование кода

Проект использует ESLint с TypeScript и React правилами.

## Deployment

### Production сборка

1. Соберите проект:
```bash
npm run build
```

2. Разверните содержимое папки `dist/` на любом статическом хостинге (Nginx, Apache, Vercel, Netlify и т.д.)

### Nginx конфигурация

Пример конфигурации для Nginx включен в `nginx.conf`. Основные моменты:

- SPA routing (все запросы идут на index.html)
- Gzip сжатие
- Кэширование статических файлов
- Health check endpoint

## Troubleshooting

### CORS ошибки

Убедитесь, что бекенд настроен на прием запросов с вашего домена. В `SecurityConfig.java` должно быть:

```java
configuration.setAllowedOriginPatterns(List.of("*"));
```

### Ошибки подключения к API

Проверьте, что:
1. Бекенд запущен и доступен
2. `VITE_API_URL` в `.env` указывает на правильный адрес
3. Нет проблем с CORS

### Проблемы с аутентификацией

1. Создайте админа через Swagger UI бекенда
2. Используйте эти credentials для входа
3. Токен сохраняется в localStorage

## Связь с бекендом

Этот фронтенд работает с бекенд-сервисом:
- Репозиторий: `E:\1_MyProjects\AltaProject (AltaTrack)\noteapp-ai-integration`
- API документация: http://localhost:8091/swagger-ui.html (когда бекенд запущен)

## Лицензия

Proprietary
