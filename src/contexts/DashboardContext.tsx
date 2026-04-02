"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

type Profile = { territory_code: string | null; is_admin: boolean }

type DashboardContextType = {
  user: User | null
  profile: Profile | null
  isAdmin: boolean
  ready: boolean
}

const DashboardContext = createContext<DashboardContextType>({
  user: null, profile: null, isAdmin: false, ready: false,
})

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [ready, setReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const init = async () => {
      // getSession() reads from localStorage — zero network latency
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.replace("/login")
        return
      }
      setUser(session.user)

      // Profile fetch goes browser → Supabase directly (no Vercel function)
      const { data: profileData } = await supabase
        .from("profiles")
        .select("territory_code, is_admin")
        .eq("id", session.user.id)
        .single()

      setProfile(profileData as Profile | null)
      setReady(true)
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) router.replace("/login")
      else setUser(session.user)
    })

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <DashboardContext.Provider value={{
      user,
      profile,
      isAdmin: profile?.is_admin === true,
      ready,
    }}>
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboard = () => useContext(DashboardContext)
