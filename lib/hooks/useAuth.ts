import { useState, useEffect } from "react"
import { Session, User } from "@supabase/supabase-js"
import { createBrowserClient } from "../supabase"

interface AuthState {
  user: User | null
  loading: boolean
}

interface AuthResponse {
  success: boolean
  user?: User
  profile?: any
  error?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      return data
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const register = async (
    email: string,
    password: string,
    name: string,
    tier: string = "free"
  ): Promise<AuthResponse> => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", email, password, name, tier }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      return data
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const logout = async (): Promise<AuthResponse> => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      return data
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  return {
    user,
    loading,
    login,
    register,
    logout,
  }
} 