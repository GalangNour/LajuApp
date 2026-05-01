import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useEmailAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.message.toLowerCase().includes('confirm')) {
        setError('Email belum dikonfirmasi. Cek inbox kamu.')
      } else if (error.message.toLowerCase().includes('invalid')) {
        setError('Email atau password salah.')
      } else {
        setError(error.message)
      }
    }
    setLoading(false)
  }

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true)
    setError(null)
    setNeedsConfirmation(false)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) {
      setError(error.message)
    } else if (!data.session) {
      // Supabase kirim email konfirmasi dulu
      setNeedsConfirmation(true)
    }
    setLoading(false)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return { signIn, signUp, signOut, loading, error, needsConfirmation }
}
