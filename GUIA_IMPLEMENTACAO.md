# PsicoAmina — Guia de Implementação (Produção)

## Mudanças nesta versão

### Frontend

1. **Signup com nome completo** — Campo `fullname` adicionado ao cadastro. Salva na tabela `users` automaticamente.

2. **"Tokens" → "Créditos"** — Toda a interface agora usa "créditos" em vez de "tokens". A TokenBar mostra "X restantes de Y" com limite dinâmico por plano.

3. **Dashboard com saldo** — Quando nenhum chat está selecionado, exibe: saudação personalizada, card de saldo de créditos com data de renovação, cards dos 3 agentes para criar chat rápido, e últimas 3 conversas recentes.

4. **Tela de planos (PricingModal)** — Cards de plano mensal e anual com features e preços. Botão de assinar (atualmente com placeholder para integração de pagamento).

5. **Bloqueio de assinatura (SubscriptionGate)** — Overlay transparente sobre o app quando `subscription_active = false`. Permite ver chats antigos mas bloqueia envio de mensagens. Botão "Ver planos" abre o PricingModal.

6. **Modal de créditos esgotados (CreditLimitModal)** — Quando edge function retorna `token_limit_reached`, mostra modal com quantidade de créditos do plano e data de renovação (dia 1 do próximo mês).

### Backend (Edge Functions)

1. **`create-subscription`** — Recebe `plan_type` (monthly/yearly), ativa assinatura no banco. Placeholder para integração com gateway de pagamento.

2. **`payment-webhook`** — Recebe callbacks do gateway de pagamento. Ativa/desativa assinatura baseado no status do pagamento.

3. **`reset-monthly-tokens`** — Zera `tokens_used` e `progress_bar_value` de todos os usuários. Desativa assinaturas expiradas. Chamada via pg_cron todo dia 1.

### Banco de Dados (migrations.sql)

- `subscription_active` (boolean) na tabela `users`
- `plan_type` (text) na tabela `users`
- `current_period_end` (timestamptz) na tabela `users`
- `attached_file_text`, `attached_file_name` na tabela `chats` (preparado para fase 2)

---

## Setup

### 1. Rodar migrations

Abra o Supabase Dashboard → SQL Editor → cole o conteúdo de `migrations.sql` → Execute.

### 2. Deploy edge functions

```bash
# Na raiz do projeto
supabase functions deploy create-subscription
supabase functions deploy payment-webhook
supabase functions deploy reset-monthly-tokens
```

Ou faça deploy manual pelo Supabase Dashboard → Edge Functions → New Function.

### 3. Configurar pg_cron (reset mensal)

1. Supabase Dashboard → Database → Extensions → Habilite `pg_cron`
2. SQL Editor → Execute o `SELECT cron.schedule(...)` do `migrations.sql` (substitua a URL e a service role key)

### 4. Variáveis de ambiente necessárias

As edge functions precisam (já configuradas automaticamente pelo Supabase):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Quando integrar gateway de pagamento, adicionar:
- `PAYMENT_GATEWAY_API_KEY` (InfinitePay, Stripe, etc.)
- `PAYMENT_WEBHOOK_SECRET` (para validar assinatura do webhook)

### 5. Build e deploy do frontend

```bash
npm install
npm run build
# Arrasta a pasta dist/ no Netlify ou Vercel
```

---

## Ativar assinatura manualmente (para testes)

Supabase Dashboard → Table Editor → tabela `users`:
1. Encontre o usuário pelo `user_auth_id`
2. Mude `subscription_active` para `true`
3. Mude `plan_type` para `monthly` ou `yearly`
4. Mude `current_period_end` para uma data futura (ex: `2026-12-31T00:00:00Z`)

---

## Próximas fases

- **Fase 2A:** Integração com gateway de pagamento (InfinitePay ou Stripe)
- **Fase 2B:** Upload de PDF no chat (pdfjs-dist + Supabase Storage)
- **Fase 3:** Painel admin, múltiplos planos, dashboard de métricas
