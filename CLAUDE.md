# ColméIA Infantil — Notas de arquitetura

SaaS de IA para psicólogas infantis. Três agentes (planejamento de sessões, criação de conteúdo, captação de pacientes). Em produção em `www.colmeiainfantil.com.br`.

## Stack

- **Frontend:** React 18 + Vite + Tailwind CSS, SPA, **sem TypeScript** (`.jsx`).
- **Backend:** Supabase (Postgres + Auth + Storage + Edge Functions Deno).
- **IA:** OpenAI (modelo `gpt-4.1-mini` no `chat-ai`).
- **Billing:** Hotmart (checkout) + webhook Hottok.
- **Deploy:** Vercel (`main` → produção automática).

## Workflow

Apenas o Renan desenvolve. **Sem PRs.** Toda mudança:

1. Testar local em **http://localhost:3006** (vite com `strictPort`).
2. Renan confirma OK.
3. Commit direto na `main`, `git push origin main`.
4. Vercel deploya prod automático.

CI/CD com testes em PRs virá no futuro — por ora, MVP.

## Estrutura

```
psicoamina/
├── src/
│   ├── App.jsx                 # Roteamento simples (não usa react-router)
│   ├── components/             # Sidebar, ChatArea, Modal, etc
│   ├── pages/                  # LandingPage, LoginPage, SignupPage, HomePage, ...
│   └── lib/
│       ├── supabase.js         # Cliente + todas as queries (SDK Supabase)
│       ├── AuthContext.jsx     # Provider de sessão/perfil/tokenUsage/isAdmin
│       ├── config.js           # PLAN_LIMITS, PRICING, CHECKOUT_URLS, timeouts
│       ├── agents.js           # 3 agentes (id, label, color, icon)
│       └── demo.js + demoData.js  # modo `?demo=true` sem Supabase
├── supabase/
│   ├── functions/              # 4 Edge Functions (Deno)
│   │   ├── chat-ai/            # IA principal: rate limit, token reserve atômico
│   │   ├── payment-webhook/    # Hotmart → ativa/desativa assinatura, idempotente
│   │   ├── sync_agent_prompt/  # Cron-driven: Google Docs → agents_prompts
│   │   └── reset-monthly-tokens/  # Cron mensal: zera tokens_used
│   ├── migrations/             # SQL applied in order (Management API ou supabase db push)
│   └── baseline/               # snapshot do schema atual (não-executável, referência)
└── vercel.json                 # Headers de segurança (CSP, HSTS, etc)
```

## Tabelas principais

| Tabela | RLS | Função |
|---|---|---|
| `users` | sim — só própria linha; UPDATE limitado a `fullname`/`profile_pic_url` (REVOKE) | Perfil + plano + role |
| `chats` | sim — só próprias | Conversas |
| `chat_messages` | sim — só próprias | Mensagens (sender: 'human' \| 'agent') |
| `agents_prompts` | leitura aberta (anon+authenticated) | System prompts dos 3 agentes |
| `user_monthly_usage` | sim — só próprias | Contador de tokens mensal |
| `payment_events` | sem policy (só service_role) | Idempotência de webhooks Hotmart |
| `rate_limits` | sem policy (só service_role) | Contadores de rate limit |

## Funções (RPC)

- `find_user_id_by_email(text) → uuid` — SECURITY DEFINER, lookup em `auth.users`
- `rate_limit_check(key, max, window_sec) → boolean` — janela deslizante, atomic
- `increment_token_usage(user_id, amount, limit) → int` — UPSERT atômico
- `verify_user_password(text) → boolean` — checa senha do user logado (use com cuidado)

## pg_cron jobs

- `sync-psico` (hora :00), `sync-marketing` (:05), `sync-customer-acquisition` (:10) — chama `sync_agent_prompt` com `X-Cron-Secret`
- `reset-monthly-tokens` (`0 0 1 * *`) — chama `reset-monthly-tokens` com `X-Cron-Secret`

## Secrets de Edge Functions (Supabase Vault)

- `OPENAI_API_KEY` — chave da conta OpenAI do Renan
- `HOTMART_HOTTOK` — secret do webhook Hotmart
- `CRON_SECRET` — secret compartilhado por todos os cron jobs internos
- `SUPABASE_SERVICE_ROLE_KEY` — auto-injetado pelo Supabase nas Functions

## Roles

- `user` (default) — assinante normal, RLS limita acesso
- `admin` — bypassa gate de assinatura (frontend + chat-ai); pode chamar `sync_agent_prompt`

Para promover: `UPDATE public.users SET role='admin' WHERE user_auth_id = (SELECT id FROM auth.users WHERE email='X')`.

## Padrões importantes

### 1. Não mexer em dado existente sem confirmação
Banco único, prod = dev. Migrations devem ser idempotentes (`IF NOT EXISTS`, `ON CONFLICT`). Antes de DELETE/TRUNCATE em prod, perguntar ao Renan.

### 2. Authorization em Edge Functions
- Funções chamadas pelo cliente (`chat-ai`, `sync_agent_prompt`): exigem JWT válido + checks aplicacionais (subscription, admin role, etc).
- Funções chamadas por webhook externo (`payment-webhook`): deploy com `--no-verify-jwt`, validar via Hottok constant-time.
- Funções chamadas por cron interno (`reset-monthly-tokens`, `sync_agent_prompt`): aceitam `X-Cron-Secret` como alternativa ao JWT admin.

### 3. CORS allowlist
Edge Functions têm `ALLOWED_ORIGINS = ['https://colmeiainfantil.com.br', 'https://www.colmeiainfantil.com.br', 'http://localhost:3006']`. Atualizar quando o domínio mudar.

### 4. RLS é a única barreira de tenant isolation
`auth.uid()` é o filtro padrão em todas as policies. Service role bypassa RLS — usa só em Edge Functions onde a validação já aconteceu via JWT.

### 5. Logs e erros
- Edge Functions: `console.error('scope:', err.message)` — vai pro Logflare do Supabase.
- Frontend: sem logger formal por enquanto. Sentry será integrado no futuro.
- **Nunca** retornar `err.message` cru pro cliente em prod — retornar código (`'internal_error'`) e logar o detalhe.

## Variáveis de ambiente (`.env`, gitignored)

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_ACCESS_TOKEN=...   # PAT do Renan, pra CLI e Management API
VERCEL_TOKEN=...
CRON_SECRET=...             # mesmo valor que está no Supabase Vault
```

## Domínios e URLs

- Produção: `https://www.colmeiainfantil.com.br` (apex `colmeiainfantil.com.br` redireciona 307)
- Supabase: `https://nwgnhuesqdnedupykthj.supabase.co`
- Hotmart checkout: `https://pay.hotmart.com/N104935072X` (offers `rc99wnbh` monthly, `87uk731h` yearly)

## Auditoria de segurança

Manual de referência: `/Users/renanteles/Documents/Projetos Antigravity/SAAS_SECURITY_MANUAL.md`. Já aplicada uma rodada completa em 2026-05-12 — 3 CRÍTICOs + 8 ALTOs + 10 MÉDIOs resolvidos. Estado atual: `npm audit` zerado, headers de segurança ativos, RLS + column grants corretos.
