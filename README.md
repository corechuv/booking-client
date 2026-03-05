# Mira Booking Client

Frontend клиент для сайта и booking-потока салона (React + TypeScript + Vite + SCSS).

## Локальный запуск

```bash
npm install
cp .env.example .env
npm run dev
```

## ENV переменные

Используется только одна переменная:

- `VITE_API_URL` — базовый URL backend API.

Пример:

```env
VITE_API_URL=http://localhost:8001/api/v1
```

## Netlify

В проект уже добавлен файл `netlify.toml`:

- build command: `npm run build`
- publish dir: `dist`
- SPA redirect: `/* -> /index.html`
- Node: `20`

### Что указать в Netlify Environment variables

- `VITE_API_URL=https://YOUR_BACKEND_DOMAIN/api/v1`

## Сборка

```bash
npm run build
```

