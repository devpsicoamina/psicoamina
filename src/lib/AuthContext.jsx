import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, getOrCreateUserProfile, getTokenUsage } from './supabase'
import { isDemoMode } from './demo'
import { DEMO_USER, DEMO_PROFILE, DEMO_TOKEN_USAGE } from './demoData'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [tokenUsage, setTokenUsage] = useState({ tokens_used: 0, progress_bar_value: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Demo mode: skip all Supabase calls
    if (isDemoMode()) {
      setSession({ user: DEMO_USER })
      setProfile(DEMO_PROFILE)
      setTokenUsage(DEMO_TOKEN_USAGE)
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess)
      if (sess?.user) {
        loadProfile(sess.user.id)
      } else {
        setLoading(false)
      }
    }).catch(() => setLoading(false))

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, sess) => {
        setSession(sess)
        if (sess?.user) {
          loadProfile(sess.user.id)
        } else {
          setProfile(null)
          setTokenUsage({ tokens_used: 0, progress_bar_value: 0 })
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  function loadProfile(userId) {
    setLoading(true)
    Promise.allSettled([
      getOrCreateUserProfile(userId),
      getTokenUsage(userId),
    ]).then(([profResult, usageResult]) => {
      if (profResult.status === 'fulfilled' && profResult.value) {
        setProfile(profResult.value)
      }
      if (usageResult.status === 'fulfilled' && usageResult.value) {
        setTokenUsage(usageResult.value)
      }
      setLoading(false)
    })
  }

  async function refreshProfile() {
    if (isDemoMode()) return
    if (!session?.user) return
    try {
      const prof = await getOrCreateUserProfile(session.user.id)
      if (prof) setProfile(prof)
    } catch (e) {}
  }

  async function refreshTokenUsage() {
    if (isDemoMode()) return
    if (!session?.user) return
    try {
      const usage = await getTokenUsage(session.user.id)
      setTokenUsage(usage)
    } catch (e) {}
  }

  const isSubscribed = Boolean(
    profile?.subscription_active &&
    (!profile?.current_period_end || new Date(profile.current_period_end) > new Date())
  )

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user || null,
      profile,
      tokenUsage,
      loading,
      isSubscribed,
      refreshProfile,
      refreshTokenUsage,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
