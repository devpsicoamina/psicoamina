export function isDemoMode() {
  return new URLSearchParams(window.location.search).get('demo') === 'true'
}

export function getPaymentStatus() {
  return new URLSearchParams(window.location.search).get('payment')
}

export function getPaymentPlan() {
  return new URLSearchParams(window.location.search).get('plan')
}

export function clearPaymentParams() {
  const url = new URL(window.location)
  url.searchParams.delete('payment')
  url.searchParams.delete('plan')
  window.history.replaceState({}, '', url)
}
