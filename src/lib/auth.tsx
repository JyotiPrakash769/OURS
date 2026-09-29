import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { db, isConfigured } from './supabase'

type Status = 'loading' | 'in' | 'out'
type SignUpResult = { error: string | null; needsConfirmation: boolean }
type Auth = {
  status: Status
  userId: string | null
  /** Resolves to null on success, or a user-facing error message. */
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string, displayName: string) => Promise<SignUpResult>
  signOut: () => Promise<void>
  deleteAccount: () => Promise<void>
}

const AuthContext = createContext<Auth | null>(null)
const NETWORK_ERROR = "Couldn't reach the server. Check your connection and try again."

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>(isConfigured ? 'loading' : 'out')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!isConfigured) return
    const client = db()
    const apply = (uid: string | null) => {
      setUserId(uid)
      setStatus(uid ? 'in' : 'out')
    }
    client.auth.getSession().then(({ data }) => apply(data.session?.user.id ?? null))
    const { data } = client.auth.onAuthStateChange((_e, session) => apply(session?.user.id ?? null))
    return () => data.subscription.unsubscribe()
  }, [])

  const signIn: Auth['signIn'] = async (email, password) => {
    const { error } = await db().auth.signInWithPassword({ email, password })
    if (!error) return null
    return error.status === 400 ? 'Email or password is incorrect.' : NETWORK_ERROR
  }

  const signUp: Auth['signUp'] = async (email, password, displayName) => {
    const { data, error } = await db().auth.signUp({ email, password, options: { data: { display_name: displayName } } })
    if (error) {
      const clientError = error.status && error.status >= 400 && error.status < 500
      return { error: clientError ? error.message : NETWORK_ERROR, needsConfirmation: false }
    }
    return { error: null, needsConfirmation: !data.session }
  }

  const signOut = async () => {
    await db().auth.signOut()
  }

  const deleteAccount = async () => {
    const { error } = await db().rpc('delete_user_account')
    if (error) throw new Error(error.message)
    await db().auth.signOut()
    setUserId(null)
    setStatus('out')
  }

  return <AuthContext.Provider value={{ status, userId, signIn, signUp, signOut, deleteAccount }}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): Auth {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
