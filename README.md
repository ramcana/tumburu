# Tumburu

A full-stack music generation web application.

## Features
- FastAPI backend with async support
- React + TypeScript + Vite frontend
- Docker Compose with Nginx reverse proxy
- Tailwind CSS, Zustand, React Query, Framer Motion
- WebSocket real-time updates
- Audio file upload, generation, and playback

## Development

```bash
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- App: http://localhost

## Environment
Copy `.env.example` to `.env` and fill in values.

## Production

```bash
docker-compose -f docker-compose.prod.yml up --build
```

## Structure
- `backend/` - FastAPI app
- `frontend/` - React app
- `nginx/` - Nginx configs
- `shared/` - Shared types/constants
