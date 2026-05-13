# GitHub Actions

## `backup.yml` — Backup diário do Supabase

Roda todo dia às **06:00 UTC** (03:00 BRT) e salva schema + dados como artifact (90 dias de retenção, gratuito).

### Configuração necessária (uma vez)

No GitHub do repo (https://github.com/devpsicoamina/psicoamina/settings/secrets/actions), adicionar 3 secrets:

| Nome | Valor | Onde achar |
|---|---|---|
| `SUPABASE_ACCESS_TOKEN` | PAT do Supabase começando com `sbp_` | https://supabase.com/dashboard/account/tokens |
| `SUPABASE_PROJECT_REF` | `nwgnhuesqdnedupykthj` | é fixo |
| `SUPABASE_DB_PASSWORD` | senha do banco | Dashboard → Settings → Database → Connection string → reveal password |

### Testar manualmente

Após configurar os secrets, em https://github.com/devpsicoamina/psicoamina/actions/workflows/backup.yml → "Run workflow" → main → Run.

Se passar, vai aparecer um artifact `supabase-backup-<run_id>-1` com `backup-schema.sql.gz` e `backup-data.sql.gz`. Baixa, descompacta, abre num editor pra confirmar.

### Restaurar de um backup

```bash
# Baixar o artifact, descompactar
gunzip backup-schema.sql.gz backup-data.sql.gz

# Conectar via psql no Supabase
psql "postgresql://postgres.nwgnhuesqdnedupykthj:[YOUR-PASSWORD]@aws-1-sa-east-1.pooler.supabase.com:5432/postgres" \
  -f backup-schema.sql \
  -f backup-data.sql
```

⚠️ Restore em produção é destrutivo. Em emergência: faça em projeto Supabase novo primeiro.
