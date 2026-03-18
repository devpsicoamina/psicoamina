# PsicoAmina MVP — React + Vite + Tailwind + Supabase

SaaS de IA para psicólogas. 3 agentes de chat especializados.

## Setup em 3 passos

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis (já preenchido, mas confira o .env)
cp .env.example .env

# 3. Rodar
npm run dev
```

Abra `http://localhost:5173` no navegador.

## Estrutura

```
src/
├── lib/
│   ├── supabase.js      # Cliente Supabase + todas as queries + edge function
│   ├── AuthContext.jsx   # Context de autenticação global
│   └── agents.js         # Configuração dos 3 agentes
├── components/
│   ├── Sidebar.jsx       # Sidebar com agentes, chats, token bar
│   ├── ChatArea.jsx      # Área de chat com mensagens e input
│   ├── TokenBar.jsx      # Barra de consumo de tokens
│   └── Modal.jsx         # Modal genérico reutilizável
├── pages/
│   ├── LoginPage.jsx     # Tela de login
│   ├── SignupPage.jsx    # Tela de cadastro
│   ├── RecoveryPage.jsx  # Recuperação de senha
│   └── HomePage.jsx      # Dashboard principal (sidebar + chat)
├── App.jsx               # Router principal (auth vs app)
├── main.jsx              # Entry point
└── index.css             # Tailwind + custom styles
```

## Stack

- React 18 + Vite
- Tailwind CSS
- @supabase/supabase-js
- react-markdown
- 100% JavaScript (sem TypeScript)
- Mobile-first responsive
