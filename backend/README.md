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
