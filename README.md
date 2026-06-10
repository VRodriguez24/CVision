# CVision

CVision es una plataforma web para crear, editar, guardar y optimizar curriculums profesionales compatibles con ATS, orientada a estudiantes proximos a egresar y recien titulados en Chile.

El proyecto esta organizado como un monorepo con una aplicacion React/Vite en el frontend y una API REST Node.js/Express en el backend. El backend persiste usuarios, sesiones, CVs y datos asociados en PostgreSQL mediante Prisma, y expone integraciones de IA con Gemini para mejorar campos y analizar CVs.

## Estructura

```txt
CVision/
├── frontend/   # React + Vite + TailwindCSS
├── backend/    # API Node.js + Express + Prisma
└── docker-compose*.yml
```

## Requisitos

- Docker Engine
- Docker Compose v2

## Levantar todo con Docker Compose

### Desarrollo

Levanta Postgres, ejecuta migraciones Prisma y deja frontend + backend en modo hot reload.

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Servicios expuestos:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Healthcheck backend: `http://localhost:4000/api/health`
- Postgres: `localhost:5433`

### Producción-like

Compila el frontend y lo sirve con Nginx; el backend queda detrás del proxy `/api`.

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

Servicios expuestos:
- Frontend + API proxy: `http://localhost:8080`
- Healthcheck backend por proxy: `http://localhost:8080/api/health`

## Variables de entorno

- `backend/.env` contiene secretos y configuración base del backend.
- En Docker Compose, `DATABASE_URL`, `PORT` y `CORS_ORIGIN` se sobreescriben según el entorno.
- `frontend/.env.example` sigue siendo útil si quieres correr el frontend fuera de Docker.

## Ejecución local sin Docker

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
npm run dev
```

## Stack

- Frontend: React 18, Vite, TailwindCSS, React Router, react-pdf, Typst WASM.
- Backend: Node.js, Express, Prisma, PostgreSQL, JWT, Zod, Pino.
- IA: Gemini API para optimizacion de texto y analisis ATS.

## Documentacion por Modulo

- [Backend](backend/README.md)
- [Frontend](frontend/README.md)

## Creditos

El motor de renderizado de PDF basado en YAML y Typst fue adaptado desde [github.com/kirlts/YaCV](https://github.com/kirlts/YaCV).
