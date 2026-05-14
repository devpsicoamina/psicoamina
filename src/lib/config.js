// Créditos por plano (deve bater com TOKEN_LIMITS na edge function chat-ai)
export const PLAN_LIMITS = {
  monthly: 80_000,
  yearly: 100_000,
}

// Fallback para quando o plano é desconhecido
export const CREDIT_LIMIT = 80_000

// Preços
export const PRICING = {
  monthly: {
    price: 19.90,
    label: 'R$ 19,90',
    period: '/mês',
  },
  yearly: {
    price: 191.00,
    label: 'R$ 191,00',
    period: '/ano',
    monthlyEquivalent: 'R$ 15,92/mês',
    savings: 'R$ 47,80',
  },
}

// Checkout (Hotmart)
export const CHECKOUT_URLS = {
  monthly: 'https://pay.hotmart.com/N104935072X?off=rc99wnbh&checkoutMode=10',
  yearly: 'https://pay.hotmart.com/N104935072X?off=87uk731h&checkoutMode=10',
}

// Constrói URL de checkout pré-preenchida quando o user já tem conta na plataforma.
// O Hotmart aceita os parâmetros email, name e phone na URL do checkout, pré-preenchendo
// o formulário de pagamento. Evita atrito + garante que o webhook chegue com o email
// certo (mesmo da conta existente).
export function buildCheckoutUrl(plan, profile, userEmail) {
  const base = CHECKOUT_URLS[plan] || CHECKOUT_URLS.monthly
  const url = new URL(base)
  if (userEmail) url.searchParams.set('email', userEmail)
  if (profile?.fullname) url.searchParams.set('name', profile.fullname)
  if (profile?.phone) url.searchParams.set('phone', profile.phone)
  return url.toString()
}

// Timeouts
export const AI_TIMEOUT_MS = 90_000
export const QUERY_TIMEOUT_MS = 8_000
