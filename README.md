# CVision

CVision es una plataforma web orientada a estudiantes próximos a egresar y recién titulados en Chile para crear currículums profesionales ATS-friendly con inteligencia artificial.

## Estructura

```txt
CVision/
├── frontend/   # React + Vite + TailwindCSS
└── backend/    # API futura
```

## Frontend

### Servidor de Desarrollo

```bash
cd frontend
npm install
npm run dev
```

### Servidor de Producción

```bash
cd frontend
npm install
npm run build
npm run preview
```

## Backend

### Servidor de Desarrollo

```bash
cd backend
npm install
docker compose up -d # levantar contenedor BDD
npm run prisma:migrate # ejecutar migraciones (opcional)
npm run dev
```

### Servidor de Producción

```bash
cd backend
npm install
docker compose up -d # levantar contenedor BDD
npm run prisma:migrate # ejecutar migraciones (opcional)
npm run start
```

## Créditos

- El motor de renderizado de PDF con `yaml` y **Typst** fue obtenido de [github.com/kirlts/YaCV](https://github.com/kirlts/YaCV)
