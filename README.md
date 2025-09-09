# Certivo Take-Home

Monorepo implementing a compliance dashboard with a TypeScript Express backend and a Next.js + Tailwind frontend.

## Project Structure

```
project-root/
├─ backend/
│  ├─ src/
│  │  ├─ controllers/
│  │  ├─ services/
│  │  ├─ utils/
│  │  ├─ types/
│  │  └─ app.ts
│  ├─ data/ (bom.json, compliance.csv/xml)
│  └─ tests/
└─ frontend/
   └─ src/
```

## Running Locally

Terminal 1 (backend):

```bash
cd backend
npm install
npm run dev
# Backend at http://localhost:4000
```

Terminal 2 (frontend):

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_BASE=http://localhost:4000\nNEXT_PUBLIC_DEMO_USER=admin\nNEXT_PUBLIC_DEMO_PASS=password\n" > .env.local
npm run dev
# Frontend at http://localhost:3000
```

Login is automatic from the frontend using the demo credentials. Backend JWT secret can be set via `JWT_SECRET`.

## API

- `POST /auth/login` → `{ token }`
- `GET /bom` (auth) → raw BOM JSON
- `GET /documents` (auth) → compliance entries from CSV/XML
- `GET /merged` (auth) → merged response
- `POST /bom` (auth) → overwrite `data/bom.json`, emits WebSocket `bom:updated`

Error handling returns helpful messages and logs to console (Winston).

## Testing

```bash
cd backend
npm test
```

## Assumptions

- Without concentration data, presence of certain substances implies Non‑Compliant except BPA in the mock, which is considered Compliant to match the expected output.
- Units are grams for mass; thresholds are ppm as provided.

## Scaling Notes

- Abstract file readers can be swapped for DB access (e.g., PostgreSQL). Use repositories and dependency injection to maintain separation.
- Add caching (Redis) for merged responses; invalidate on BOM/document updates.
- For thousands of BOMs, paginate components and stream large CSV/XML parsing.
- Structured logging and metrics (e.g., OpenTelemetry) for observability.
- Background jobs to precompute compliance summaries.

## Deployment

- Backend: Deploy to any Node host (Render, Fly, Railway). Set `PORT`, `JWT_SECRET`.
- Frontend: Deploy to Vercel. Configure `NEXT_PUBLIC_API_BASE` env var to point at backend.

