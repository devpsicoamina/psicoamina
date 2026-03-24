import { useState } from 'react'
import { useAuth } from './lib/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import RecoveryPage from './pages/RecoveryPage'
import TermosPage from './pages/TermosPage'
import PrivacidadePage from './pages/PrivacidadePage'
import SuportePage from './pages/SuportePage'
import HomePage from './pages/HomePage'
import Logo from './components/Logo'

export default function App() {
  const { user, loading } = useAuth()
  const [authPage, setAuthPage] = useState('landing')

  if (loading) {
    return (
      <div className="h-screen bg-bg-alternate flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Logo size="lg" dark />
          <div className="mt-6">
            <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    switch (authPage) {
      case 'login':
        return <LoginPage onSwitch={setAuthPage} />
      case 'signup':
        return <SignupPage onSwitch={setAuthPage} />
      case 'recovery':
        return <RecoveryPage onSwitch={setAuthPage} />
      case 'termos':
        return <TermosPage onSwitch={setAuthPage} />
      case 'privacidade':
        return <PrivacidadePage onSwitch={setAuthPage} />
      case 'suporte':
        return <SuportePage onSwitch={setAuthPage} />
      default:
        return <LandingPage onSwitch={setAuthPage} />
    }
  }

  return <HomePage />
}
