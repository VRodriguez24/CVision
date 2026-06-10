# CVision

CVision es una plataforma web orientada a estudiantes próximos a egresar y recién titulados en Chile para crear currículums profesionales ATS-friendly con inteligencia artificial.

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

## Créditos

- El motor de renderizado de PDF con `yaml` y **Typst** fue obtenido de [github.com/kirlts/YaCV](https://github.com/kirlts/YaCV)
