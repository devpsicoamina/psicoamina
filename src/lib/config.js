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

// Timeouts
export const AI_TIMEOUT_MS = 90_000
export const QUERY_TIMEOUT_MS = 8_000
