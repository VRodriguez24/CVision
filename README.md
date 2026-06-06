# CVision

CVision es una plataforma web para crear, editar, guardar y optimizar curriculums profesionales compatibles con ATS, orientada a estudiantes proximos a egresar y recien titulados en Chile.

El proyecto esta organizado como un monorepo con una aplicacion React/Vite en el frontend y una API REST Node.js/Express en el backend. El backend persiste usuarios, sesiones, CVs y datos asociados en PostgreSQL mediante Prisma, y expone integraciones de IA con Gemini para mejorar campos y analizar CVs.

## Estructura

```txt
CVision/
├── backend/    # API REST Express + Prisma + PostgreSQL
└── frontend/   # React + Vite + TailwindCSS + Typst WASM
```

## Stack

- Frontend: React 18, Vite, TailwindCSS, React Router, react-pdf, Typst WASM.
- Backend: Node.js, Express, Prisma, PostgreSQL, JWT, Zod, Pino.
- Infra local: Docker Compose para PostgreSQL.
- IA: Gemini API para optimizacion de texto y analisis ATS.

## Requisitos

- Node.js 22 o compatible con los scripts del proyecto.
- npm.
- Docker y Docker Compose para levantar PostgreSQL local.
- Opcional: una API key de Gemini para usar las funciones de IA.

## Configuracion Rapida

1. Configurar variables de entorno:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

1. Instalar dependencias:

```bash
cd backend
npm install

cd ../frontend
npm install
```

1. Levantar la base de datos y preparar Prisma:

```bash
cd backend
docker compose up -d
npm run prisma:migrate
npm run prisma:seed
```

1. Iniciar backend y frontend en terminales separadas:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

URLs locales por defecto:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000/api`
- Health check: `http://localhost:4000/api/health`
- PostgreSQL: `localhost:5433`

## Comandos Utiles

Backend:

```bash
cd backend
npm run dev        # levantar server en local
npm run start      # levantar server en producción
npm run lint
npm run prisma:migrate
npm run prisma:seed
npm run prisma:studio
```

Frontend:

```bash
cd frontend
npm run dev        # levantar server en local
npm run build      # build bundle
npm run preview    # levantar server en producción
npm run lint
npm run typecheck
```

## Funcionalidades Principales

- Registro, login, logout, verificacion de email y recuperacion de contrasena.
- Sesion con access token y refresh token.
- Editor de CV con formulario y previsualizacion PDF.
- Renderizado local del PDF con Typst WASM y fuentes incluidas en `frontend/public/fonts`.
- Guardado, listado, carga, renombrado y eliminacion de CVs.
- Mejora de campos del CV con IA.
- Analisis del CV con score, sugerencias, inconsistencias, campos faltantes y keywords ATS.
- Rutas protegidas por autenticacion y ruta de administracion para roles `ADMIN` y `MODERATOR`.

## Documentacion por Modulo

- [Backend](backend/README.md)
- [Frontend](frontend/README.md)

## Creditos

El motor de renderizado de PDF basado en YAML y Typst fue adaptado desde [github.com/kirlts/YaCV](https://github.com/kirlts/YaCV).
