# CVision Backend

API REST de CVision construida con Node.js, Express, PostgreSQL y Prisma.

## Docker

La forma recomendada de levantar el backend es desde la raíz del proyecto:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Ese flujo:
- inicia Postgres
- ejecuta `prisma migrate deploy` en un contenedor `migrate`
- levanta el backend en `http://localhost:4000`

## Ejecución local

```bash
npm install
npm run dev
```

Para usar una base local fuera de Docker, ajusta `DATABASE_URL` en `.env`.


### Configuracion local (fuera de Docker)

Crear el archivo `.env` desde el ejemplo:

```bash
cp .env.example .env
```

Variables disponibles:

| Variable | Descripcion | Valor local por defecto |
| --- | --- | --- |
| `NODE_ENV` | Ambiente de ejecucion | `development` |
| `PORT` | Puerto HTTP del backend | `4000` |
| `API_PREFIX` | Prefijo global de la API | `/api` |
| `DATABASE_URL` | Conexion PostgreSQL usada por Prisma | `postgresql://cvision:cvision@localhost:5433/cvision?schema=public` |
| `JWT_ACCESS_SECRET` | Secreto para access tokens | Cambiar en ambientes reales |
| `JWT_REFRESH_SECRET` | Secreto para refresh tokens | Cambiar en ambientes reales |
| `JWT_ACCESS_EXPIRES_IN` | Duracion del access token en segundos | `900` |
| `JWT_REFRESH_EXPIRES_IN` | Duracion del refresh token en segundos | `604800` |
| `CORS_ORIGIN` | Origen permitido para el frontend | `http://localhost:5173` |
| `LOG_LEVEL` | Nivel de logs Pino | `info` |
| `GEMINI_API_KEY` | API key de Gemini | Vacio |
| `AI_MODEL` | Modelo Gemini usado por la API | `gemini-2.5-flash` |
| `AI_IMPROVE_FIELD_MAX_OUTPUT_TOKENS` | Maximo de tokens de salida para mejorar campos con IA | `4096` |


La API queda disponible en `http://localhost:4000/api`.

Health check:

```bash
curl http://localhost:4000/api/health
```

## Endpoints

Todos los endpoints viven bajo `API_PREFIX`, por defecto `/api`.

### Health

- `GET /api/health`: estado del servicio y disponibilidad de base de datos.

### Auth

- `POST /api/auth/register`: crea usuario con consentimientos requeridos.
- `POST /api/auth/login`: inicia sesion y retorna access token, refresh token y usuario.
- `POST /api/auth/refresh`: renueva sesion usando refresh token.
- `POST /api/auth/logout`: revoca refresh token. Requiere autenticacion.
- `POST /api/auth/verify-email`: verifica email mediante token.
- `POST /api/auth/forgot-password`: crea flujo de recuperacion.
- `POST /api/auth/reset-password`: restablece contrasena mediante token.

### Users

- `GET /api/users/me`: retorna el usuario autenticado.

### CVs

Requieren `Authorization: Bearer <accessToken>`.

- `POST /api/cvs`: crea un CV con `title` y `snapshot`.
- `GET /api/cvs`: lista los CVs del usuario autenticado.
- `GET /api/cvs/:cvId`: obtiene metadata y snapshot de un CV.
- `PUT /api/cvs/:cvId`: actualiza el snapshot de un CV.
- `PATCH /api/cvs/:cvId`: renombra un CV.
- `DELETE /api/cvs/:cvId`: elimina un CV.

### IA

Requieren autenticacion y `GEMINI_API_KEY` configurada.

- `POST /api/ai/improve-field`: mejora el texto de un campo del CV sin inventar datos.
- `POST /api/ai/analyze-cv`: analiza el CV y retorna score, sugerencias, inconsistencias, campos faltantes y keywords.

Si `GEMINI_API_KEY` no esta configurada, los endpoints de IA responden error de configuracion del servicio.

## Estructura Interna de archivos

```txt
src/
├── app.js                 # Configuracion Express, middlewares y rutas
├── server.js              # Arranque HTTP y cierre ordenado de Prisma
├── config/                # Variables de entorno y seguridad/CORS
├── errors/                # Errores y codigos normalizados
├── lib/                   # Prisma, logger, passwords y tokens
├── middlewares/           # Auth, autorizacion, validacion, logging y errores
├── modules/               # Auth, users, cvs, ai y health
└── routes/index.js        # Montaje de rutas bajo /api
```
