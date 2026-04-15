# ColméIA Infantil — Guia de Implementação (Produção)

## Mudanças nesta versão

### Frontend

1. **Signup com nome completo** — Campo `fullname` adicionado ao cadastro. Salva na tabela `users` automaticamente.

2. **"Tokens" → "Créditos"** — Toda a interface agora usa "créditos" em vez de "tokens". A TokenBar mostra "X restantes de Y" com limite dinâmico por plano.

3. **Dashboard com saldo** — Quando nenhum chat está selecionado, exibe: saudação personalizada, card de saldo de créditos com data de renovação, cards dos 3 agentes para criar chat rápido, e últimas 3 conversas recentes.

4. **Tela de planos (PricingModal)** — Cards de plano mensal e anual com features e preços. Botão de assinar redireciona para checkout do Hotmart.

5. **Bloqueio de assinatura (SubscriptionGate)** — Overlay transparente sobre o app quando `subscription_active = false`. Permite ver chats antigos mas bloqueia envio de mensagens. Botão "Ver planos" abre o PricingModal.

6. **Modal de créditos esgotados (CreditLimitModal)** — Quando edge function retorna `token_limit_reached`, mostra modal com quantidade de créditos do plano e data de renovação (dia 1 do próximo mês).

### Backend (Edge Functions)

1. **`payment-webhook`** — Recebe webhooks do Hotmart. Valida `HOTMART_HOTTOK`, ativa/desativa assinatura baseado no evento. Mapeia offer codes para plan types.

2. **`reset-monthly-tokens`** — Zera `tokens_used` e `progress_bar_value` de todos os usuários. Desativa assinaturas expiradas. Chamada via pg_cron todo dia 1. Autenticada via `CRON_SECRET`.

3. **`sync_agent_prompt`** — Sincroniza prompts dos agentes a partir de Google Docs públicos. Chamada via pg_cron a cada hora.

### Banco de Dados (migrations.sql)

- `subscription_active` (boolean) na tabela `users`
- `plan_type` (text) na tabela `users`
- `current_period_end` (timestamptz) na tabela `users`
- `attached_file_text`, `attached_file_name` na tabela `chats`

---

## Setup

### 1. Rodar migrations

Abra o Supabase Dashboard → SQL Editor → cole o conteúdo de `migrations.sql` → Execute.

### 2. Deploy edge functions

```bash
supabase functions deploy payment-webhook
supabase functions deploy reset-monthly-tokens
supabase functions deploy sync_agent_prompt
supabase functions deploy chat-ai
```

Ou faça deploy manual pelo Supabase Dashboard → Edge Functions → New Function.

### 3. Configurar pg_cron (reset mensal)

1. Supabase Dashboard → Database → Extensions → Habilite `pg_cron` e `pg_net`
2. SQL Editor → Execute:

```sql
SELECT cron.schedule(
  'reset-monthly-tokens',
  '0 0 1 * *',
  $$
  SELECT net.http_post(
    url := 'YOUR_SUPABASE_URL/functions/v1/reset-monthly-tokens',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Cron-Secret', 'YOUR_CRON_SECRET'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

### 4. Variáveis de ambiente necessárias

As edge functions precisam (já configuradas automaticamente pelo Supabase):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Configurar manualmente em Supabase → Settings → Edge Functions → Secrets:
- `OPENAI_API_KEY`
- `HOTMART_HOTTOK` (token de validação do webhook do Hotmart)
- `CRON_SECRET` (secret para autenticação do cron job)

### 5. Build e deploy do frontend

```bash
npm install
npm run build
```

Deploy automático via Vercel no branch `main`.

---

## Ativar assinatura manualmente (para testes)

Supabase Dashboard → Table Editor → tabela `users`:
1. Encontre o usuário pelo `user_auth_id`
2. Mude `subscription_active` para `true`
3. Mude `plan_type` para `monthly` ou `yearly`
4. Mude `current_period_end` para uma data futura (ex: `2026-12-31T00:00:00Z`)
