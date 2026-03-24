import { useState } from 'react'
import { useAuth } from './lib/AuthContext'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import RecoveryPage from './pages/RecoveryPage'
import HomePage from './pages/HomePage'
import Logo from './components/Logo'

export default function App() {
  const { user, loading } = useAuth()
  const [authPage, setAuthPage] = useState('login')

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
      case 'signup':
        return <SignupPage onSwitch={setAuthPage} />
      case 'recovery':
        return <RecoveryPage onSwitch={setAuthPage} />
      default:
        return <LoginPage onSwitch={setAuthPage} />
    }
  }

  return <HomePage />
}
