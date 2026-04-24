"use client"

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light'

const ThemeContext = createContext<{ theme: Theme, toggleTheme: () => void }>({
    theme: 'light',
    toggleTheme: () => { }
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Force light mode only
        setTheme('light')
        document.documentElement.classList.remove('dark')
    }, [])

    const toggleTheme = () => {
        // Disabled - light mode only
        // Do nothing when called
    }

    return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
