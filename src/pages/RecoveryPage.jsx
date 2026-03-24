import { useState } from 'react'
import { Mail } from 'lucide-react'
import { resetPassword } from '../lib/supabase'
import Logo from '../components/Logo'

export default function RecoveryPage({ onSwitch }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-alternate flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-card w-full max-w-[420px] p-8 animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <Logo size="md" />
        </div>

        {sent ? (
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 bg-accent-teal/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <Mail className="w-10 h-10 text-accent-teal" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">Email enviado!</h2>
            <p className="text-text-secondary mb-8">
              Verifique sua caixa de entrada para o link de recuperação.
            </p>
            <button
              onClick={() => onSwitch('login')}
              className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition shadow-button"
            >
              Voltar ao login
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-text-primary text-center mb-2">Recuperar senha</h2>
            <p className="text-text-secondary text-center mb-6 text-sm">
              Informe seu email para receber um link de recuperação.
            </p>
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

              {error && (
                <div className="bg-accent-error/10 text-accent-error px-4 py-2.5 rounded-xl text-sm font-medium animate-fade-in">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition shadow-button disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>
            </form>

            <button
              onClick={() => onSwitch('login')}
              className="mt-6 w-full text-center text-sm text-primary-600 font-medium hover:underline"
            >
              ← Voltar ao login
            </button>
          </>
        )}
      </div>
    </div>
  )
}
