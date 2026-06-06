# CVision Frontend

Aplicacion web de CVision construida con React, Vite y TailwindCSS. Incluye landing page, autenticacion, dashboard protegido, editor de CV, previsualizacion PDF local con Typst WASM y consumo de la API del backend.

## Stack

- React 18.
- Vite 5.
- TailwindCSS.
- React Router.
- TypeScript gradual sobre una base mixta `.jsx` y `.tsx`.
- react-pdf y pdfjs para visualizar PDFs.
- Typst WASM (`@myriaddreamin/typst.ts`) para compilar el CV en el navegador.
- js-yaml para transformar datos del formulario a YAML/render document.
- lucide-react para iconos.

## Requisitos

- Node.js 22 o compatible.
- npm.
- Backend corriendo en `http://localhost:4000/api` para autenticacion, guardado de CVs e IA.

## Configuracion

Crear `.env` desde el ejemplo:

```bash
cp .env.example .env
```

Variable disponible:

| Variable | Descripcion | Valor local por defecto |
| --- | --- | --- |
| `VITE_API_BASE_URL` | URL base de la API consumida por `apiClient` | `http://localhost:4000/api` |

## Puesta en Marcha Local

```bash
npm install
npm run dev
```

La aplicacion queda disponible en `http://localhost:5173`.

Para que las funciones protegidas funcionen, levantar tambien el backend:

```bash
cd ../backend
docker compose up -d
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## Scripts

```bash
npm run dev        # Servidor Vite en puerto 5173
npm run build      # Build de produccion en dist/
npm run preview    # Sirve el build en puerto 5173
npm run lint       # ESLint sobre el proyecto
npm run typecheck  # TypeScript sin emitir archivos
```

## Rutas

Rutas publicas:

- `/`: landing page.
- `/auth`: login.
- `/auth/register`: registro.
- `/auth/recover`: recuperacion de contrasena.

Rutas protegidas:

- `/dashboard`: editor principal de CV.
- `/dashboard?cvId=<id>`: editor cargando un CV guardado.
- `/dashboard/cvs`: listado, apertura, renombrado y eliminacion de CVs guardados.
- `/dashboard/cvs/new`: placeholder.
- `/dashboard/optimizer`: placeholder.
- `/dashboard/jobs`: placeholder.
- `/dashboard/settings`: placeholder.
- `/dashboard/help`: placeholder.
- `/dashboard/admin`: dashboard administrativo para roles `ADMIN` y `MODERATOR`.

## Funcionalidades

- Registro e inicio de sesion contra el backend.
- Persistencia de access token y refresh token en `localStorage`.
- Limpieza automatica de sesion ante respuestas `401`.
- Editor de CV con formulario, panel dividido y vista PDF.
- Compilacion local del PDF desde datos del formulario usando YAML, Typst y WASM.
- Descarga del PDF generado con nombre sanitizado.
- Guardado de CV nuevo y actualizacion de CV existente.
- Listado de CVs guardados con acciones de abrir, renombrar y eliminar.
- Mejora de campos del CV mediante `/ai/improve-field`.
- Analisis ATS mediante `/ai/analyze-cv`, con sugerencias aplicables, keywords, inconsistencias y campos faltantes.
- Toasters y modales para feedback de carga, guardado y confirmaciones.

## Renderizado de PDF

El flujo de renderizado esta dividido en:

- `src/adapters/mapFormDataToRenderCvDoc.ts`: adapta el formulario al documento esperado por el motor.
- `src/engine/yamlToTypst.ts`: transforma YAML/render document a fuente Typst.
- `src/hooks/useRenderEngine.ts`: inicializa Typst WASM, carga fuentes locales y compila el PDF con debounce.
- `src/components/PDFViewer.tsx`: renderiza el PDF con `react-pdf`.

Assets requeridos para el render:

- `public/typst_ts_web_compiler_bg.wasm`
- `public/fonts/*`
- `public/packages/preview/rendercv/0.2.0/*`

Estos archivos deben mantenerse disponibles en `public/` porque se sirven directamente desde Vite.

## Consumo de API

La capa HTTP central esta en `src/services/apiClient.js`. Usa `VITE_API_BASE_URL` y agrega `Authorization: Bearer <accessToken>` cuando hay sesion activa.

Servicios principales:

- `src/services/authService.js`: login, registro, refresh, logout, verificacion, recuperacion y usuario actual.
- `src/services/cvService.js`: crear, listar, obtener, actualizar, renombrar y eliminar CVs.
- `src/services/aiService.ts`: mejora de campos y analisis ATS.

## Estructura Interna

```txt
src/
├── adapters/       # Mapeo del formulario al documento de render
├── assets/         # Imagenes e iconos importados por React
├── components/     # UI, navegacion, auth, formulario y PDF viewer
├── context/        # AuthContext y helpers de contexto
├── engine/         # Transformacion YAML/Typst y temas
├── hooks/          # useRenderEngine
├── layouts/        # Layouts publico, auth, app y dashboard
├── pages/          # Landing, auth y dashboard
├── routes/         # Router y rutas protegidas
├── services/       # Clientes de API
├── styles/         # CSS global y Tailwind
├── types/          # Tipos compartidos del formulario/usuario
└── utils/          # Utilidades generales
```

## Notas de Desarrollo

- El proyecto usa una base mixta JavaScript/TypeScript; Vite resuelve imports `.js` hacia archivos `.ts/.tsx` cuando corresponde.
- El worker de PDF.js se carga desde `unpkg.com` usando la version de `pdfjs-dist`.
- Las funciones de IA requieren sesion activa y una `GEMINI_API_KEY` configurada en el backend.
- Si se cambia el puerto del backend, actualizar `VITE_API_BASE_URL`.

## Creditos

Parte del motor de renderizado de PDF basado en YAML y Typst fue adaptado desde [github.com/kirlts/YaCV](https://github.com/kirlts/YaCV).
