import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { signIn } from '../lib/supabase'
import Logo from '../components/Logo'

export default function LoginPage({ onSwitch }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
    } catch (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Email ou senha incorretos.'
        : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-alternate flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-card w-full max-w-[420px] p-8 animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" dark />
          <p className="text-text-secondary mt-3 text-sm">
            Para iniciar preencha os dados abaixo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
                autoComplete="current-password"
                className="w-full px-4 py-3 border-2 border-secondary/30 rounded-xl focus:ring-0 focus:border-primary-600 outline-none transition bg-white text-text-primary pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary-600 transition"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-accent-error/10 text-accent-error px-4 py-2.5 rounded-xl text-sm font-medium animate-fade-in">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition shadow-button disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Entrando...
              </span>
            ) : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 text-center space-y-3">
          <p className="text-sm text-text-secondary">
            Não possui conta?{' '}
            <button onClick={() => onSwitch('signup')} className="text-primary-600 font-semibold hover:underline">
              Crie uma
            </button>
          </p>
          <p className="text-sm text-text-secondary">
            Esqueceu sua senha?{' '}
            <button onClick={() => onSwitch('recovery')} className="text-primary-600 font-semibold hover:underline">
              Recupere aqui
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
