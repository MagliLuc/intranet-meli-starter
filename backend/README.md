# Intranet Meli - Backend

## Requisitos
- Node.js 18+
- SQL Server Express (puerto 1433)
- Variables de entorno (.env)

## Setup
```bash
cd backend
cp .env.example .env
# Editar .env con credenciales reales
npm i
npm run dev
```

API en: `http://localhost:4000`

## Endpoints clave
- `GET /api/health` -> check
- `POST /api/auth/register` -> { username, password, role? }
- `POST /api/auth/login` -> { username, password }
- `GET /api/auth/me` (Bearer token)
- `GET /api/meli/oauth/login` (Bearer token) -> redirige a Meli
- `GET /api/meli/oauth/callback` -> guarda tokens y redirige al frontend
- `POST /api/meli/oauth/refresh` (Bearer token)
- `GET /api/meli/token` (Bearer token) -> access_token válido
- `GET /api/publications` (Bearer) -> lista desde DB
- `POST /api/publications/sync` (Bearer admin) -> sync con Meli
- `POST /api/publications/:meli_id/pause|activate` (Bearer admin)

## Notas
- Sequelize `sync()` crea tablas si no existen.
- `meli_tokens.user_id` es único (1 conjunto de tokens por usuario interno).
