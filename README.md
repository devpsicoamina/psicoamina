# ColméIA Infantil

SaaS de assistentes de IA para psicólogas infantis. Três agentes especializados: planejamento de sessões, criação de conteúdo e captação de pacientes.

## Stack

- React 18 + Vite + Tailwind CSS
- Supabase (PostgreSQL + Auth + Edge Functions)
- OpenAI (gpt-4.1-mini) via Edge Function
- Deploy: Vercel

## Como rodar local

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`.

## Build e deploy

```bash
npm run build
```

Deploy automático via Vercel no branch `main`.

## Variáveis de ambiente

### Frontend (.env)

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Edge Functions (Supabase Secrets)

- `SUPABASE_URL` (automático)
- `SUPABASE_SERVICE_ROLE_KEY` (automático)
- `OPENAI_API_KEY`
- `HOTMART_HOTTOK`
- `CRON_SECRET`
