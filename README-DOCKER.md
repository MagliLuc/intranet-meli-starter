# Intranet Meli - Docker Compose

## Requisitos
- Docker 24+ y Docker Compose
- (Apple Silicon) SQL Server solo tiene imagen amd64. Si estás en M1/M2/M3, agregá `--platform=linux/amd64` a la línea del servicio `db` o al comando `docker buildx`.

## Variables importantes
- El contenedor `db` usa `SA_PASSWORD` (por defecto `YourStrong!Passw0rd`). Podés cambiarla exportando `MSSQL_SA_PASSWORD` en tu shell:
  ```bash
  export MSSQL_SA_PASSWORD='OtraClave!Fuerte2024'
  ```

- El backend toma su config de `backend/.env.docker`. Completá:
  - `MELI_APP_ID`, `MELI_CLIENT_SECRET`
  - Si cambiás el puerto/host, ajustá `APP_URL`, `FRONTEND_URL` y el `VITE_API_BASE_URL` del frontend.

## Levantar
```bash
cd intranet-meli-starter
docker compose up -d --build
```

Servicios:
- Frontend: http://localhost:5173
- Backend:  http://localhost:4000
- SQL Server: localhost:1433 (usuario `sa`)

> El backend espera que la DB `intranet_meli` exista; Sequelize la creará si tiene permisos.

## Primeros pasos
1. Crear usuario interno (admin)
   ```bash
   curl -X POST http://localhost:4000/api/auth/register      -H "Content-Type: application/json"      -d '{"username":"admin","password":"123456","role":"admin"}'
   ```
2. Abrí el frontend y logueate.
3. Conectar Mercado Libre (botón) y autorizar.
4. En **Publicaciones**, si sos admin, podés **Sincronizar** y luego **Pausar/Activar**.

## Tips
- Logs: `docker compose logs -f backend` y `docker compose logs -f db`
- Reiniciar solo backend después de cambio de código:
  ```bash
  docker compose build backend && docker compose up -d backend
  ```

## Apple Silicon (M1/M2/M3)
Agregá la plataforma en `docker-compose.yml` dentro del servicio `db`:
```yaml
services:
  db:
    platform: linux/amd64
    image: mcr.microsoft.com/mssql/server:2022-latest
    ...
```
