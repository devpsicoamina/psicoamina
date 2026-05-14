import { useState } from 'react'
import { Check, Eye, Loader2, ArrowLeft } from 'lucide-react'
import { signUp } from '../lib/supabase'
import Logo from '../components/Logo'

function isStrongPassword(pw) {
  if (pw.length < 8) return false
  const hasLetter = /[A-Za-z]/.test(pw)
  const hasDigit = /\d/.test(pw)
  return hasLetter && hasDigit
}

export default function SignupPage({ onSwitch }) {
  const [fullname, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!fullname.trim()) {
      setError('Informe seu nome completo.')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    if (!isStrongPassword(password)) {
      setError('A senha deve ter no mínimo 8 caracteres, com letras e números.')
      return
    }
    if (!termsAccepted) {
      setError('Você precisa aceitar os Termos de Uso e a Política de Privacidade.')
      return
    }

    setLoading(true)
    try {
      await signUp(email, password, fullname.trim(), termsAccepted)
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-bg-alternate flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-card w-full max-w-[420px] p-8 text-center animate-fade-in">
          <div className="w-20 h-20 bg-accent-teal/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <Check className="w-10 h-10 text-accent-teal" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Conta criada com sucesso!</h2>
          <p className="text-text-secondary mb-8">
            Enviamos um email de verificação para <strong className="text-primary-600">{email}</strong>. Verifique sua caixa de entrada.
          </p>
          <button
            onClick={() => onSwitch('login')}
            className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition shadow-button"
          >
            Ir para o login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-alternate flex items-center justify-center p-4 relative">
      <button
        onClick={() => onSwitch('landing')}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-primary-600 transition px-3 py-2 rounded-lg hover:bg-white/60"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>
      <div className="bg-white rounded-2xl shadow-card w-full max-w-[420px] p-8 animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <Logo size="md" dark />
          <p className="text-text-secondary mt-3 text-sm">
            Crie sua conta para começar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-600 mb-1.5">Nome completo</label>
            <input
              type="text"
              value={fullname}
              onChange={e => setFullname(e.target.value)}
              className="w-full px-4 py-3 border-2 border-secondary/30 rounded-xl focus:ring-0 focus:border-primary-600 outline-none transition bg-white text-text-primary placeholder:text-secondary/50"
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-600 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-secondary/30 rounded-xl focus:ring-0 focus:border-primary-600 outline-none transition bg-white text-text-primary placeholder:text-secondary/50"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-600 mb-1.5">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full px-4 py-3 border-2 border-secondary/30 rounded-xl focus:ring-0 focus:border-primary-600 outline-none transition bg-white text-text-primary pr-12"
                placeholder="Mínimo 8 caracteres, letras + números"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary-600 transition"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-600 mb-1.5">Confirmar senha</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full px-4 py-3 border-2 border-secondary/30 rounded-xl focus:ring-0 focus:border-primary-600 outline-none transition bg-white text-text-primary"
              placeholder="Repita a senha"
              required
            />
          </div>

          <label className="flex items-start gap-2 text-sm text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={e => setTermsAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-primary-600"
              required
            />
            <span>
              Li e concordo com os{' '}
              <a href="/termos" target="_blank" rel="noopener noreferrer" className="text-primary-600 font-semibold hover:underline">Termos de Uso</a>
              {' '}e a{' '}
              <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="text-primary-600 font-semibold hover:underline">Política de Privacidade</a>.
            </span>
          </label>

          {error && (
            <div className="bg-accent-error/10 text-accent-error px-4 py-2.5 rounded-xl text-sm font-medium animate-fade-in">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition shadow-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Criando conta...
              </span>
            ) : 'Criar conta'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-text-secondary">
          Já possui conta?{' '}
          <button onClick={() => onSwitch('login')} className="text-primary-600 font-semibold hover:underline">
            Faça o login
          </button>
        </p>
      </div>
    </div>
  )
}
