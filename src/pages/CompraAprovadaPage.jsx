import { useEffect, useState } from 'react'
import { CheckCircle, Mail, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function CompraAprovadaPage({ onSwitch }) {
  const [session, setSession] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session)
        setCheckingSession(false)
      }
    })
    return () => { mounted = false }
  }, [])

  // FLUXO B: Já tinha conta e tava logada — agora só ativou a assinatura
  if (session?.user) {
    return (
      <div className="min-h-screen bg-bg-alternate font-sans flex items-center justify-center px-5">
        <div className="max-w-md w-full text-center animate-fade-in">
          <img src="/abelha.png" alt="ColméIA" className="w-24 mx-auto mb-6" draggable={false} />
          <div className="bg-white rounded-2xl p-8 shadow-card border border-primary-100">
            <div className="w-16 h-16 bg-accent-teal/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-accent-teal" />
            </div>
            <h1 className="text-2xl font-extrabold text-primary-600 mb-3">
              Sua assinatura tá ativa! 🎉
            </h1>
            <p className="text-base text-text-secondary leading-relaxed mb-6">
              Pagamento confirmado. Agora você tem acesso completo aos três agentes da ColméIA.
            </p>
            <button
              onClick={() => window.location.assign('/')}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-primary-600 text-white rounded-xl font-bold text-base hover:bg-primary-700 transition shadow-button"
            >
              Continuar pra plataforma
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // FLUXO A: Não tinha conta — webhook está criando + enviando email com magic link
  return (
    <div className="min-h-screen bg-bg-alternate font-sans flex items-center justify-center px-5 py-12">
      <div className="max-w-md w-full text-center animate-fade-in">
        <img src="/abelha.png" alt="ColméIA" className="w-24 mx-auto mb-6" draggable={false} />
        <div className="bg-white rounded-2xl p-8 shadow-card border border-primary-100">
          <div className="w-16 h-16 bg-accent-teal/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-accent-teal" />
          </div>
          <h1 className="text-2xl font-extrabold text-primary-600 mb-3">
            Bem-vinda à ColméIA! 🐝
          </h1>
          <p className="text-base text-text-secondary leading-relaxed mb-6">
            Pagamento confirmado e sua conta foi criada com o e-mail que você usou no Hotmart.
          </p>

          <div className="bg-bg-alternate rounded-xl p-4 mb-6 border border-primary-100">
            <Mail className="w-5 h-5 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-text-primary mb-1">
              Verifique sua caixa de entrada
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">
              Enviamos um e-mail com um link de acesso pra você entrar na primeira vez sem precisar de senha. Se não aparecer em alguns minutos, confere o spam.
            </p>
          </div>

          <p className="text-sm text-text-secondary mb-3">Já recebeu o link e quer testar agora?</p>
          <button
            onClick={() => onSwitch?.('login')}
            className="w-full py-3 bg-white border-2 border-primary-600 text-primary-600 rounded-xl font-bold text-sm hover:bg-primary-50 transition"
          >
            Ir pra tela de login
          </button>

          <p className="mt-6 text-xs text-text-secondary">
            Não recebeu nada em 5 minutos? Chame a gente no{' '}
            <a
              href="https://wa.me/5541999192683"
              target="_blank" rel="noopener noreferrer"
              className="text-primary-600 font-semibold hover:underline"
            >WhatsApp</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
