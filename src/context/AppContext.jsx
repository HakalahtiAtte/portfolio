import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()
const LangContext  = createContext()

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme')
    if (stored) return stored
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  })

  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('lang', lang)
  }, [lang])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  const toggleLang  = () => setLang(l => l === 'en' ? 'fi' : 'en')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <LangContext.Provider value={{ lang, toggleLang }}>
        {children}
      </LangContext.Provider>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
export const useLang  = () => useContext(LangContext)
