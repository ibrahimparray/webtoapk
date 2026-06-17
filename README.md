# Website to APK Converter

Transform any HTTPS website into a native Android application.

## Project Structure

```
project/
├── frontend/          # React + Vite + Tailwind CSS
│   ├── src/           # Source files
│   ├── public/        # Static assets
│   ├── package.json
│   └── vite.config.ts
│
├── backend/           # Node.js + Express
│   ├── routes/        # API route definitions
│   ├── controllers/   # Request handlers
│   ├── middleware/     # Express middleware
│   ├── services/      # Business logic
│   ├── config/        # Configuration
│   ├── scripts/       # Utility scripts
│   ├── android-template/  # Android project template
│   ├── package.json
│   └── server.js
│
└── README.md
```

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm start
```

## Environment Variables

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_PROXY_TARGET` | Vite proxy target for API | `http://localhost:3001` |
| `VITE_API_URL` | API base URL (leave empty for same-origin) | `` |

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `3001` |
| `FRONTEND_DIST` | Path to built frontend | `../frontend/dist` |
| `ANDROID_HOME` | Android SDK path | Auto-detected |
