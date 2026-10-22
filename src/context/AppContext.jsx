import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()
const LangContext  = createContext()

function readPreference(key, allowedValues, fallback) {
  try {
    const stored = localStorage.getItem(key)
    return allowedValues.includes(stored) ? stored : fallback
  } catch {
    return fallback
  }
}

function savePreference(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    return
  }
}

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const fallback = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
    return readPreference('theme', ['light', 'dark'], fallback)
  })

  const [lang, setLang] = useState(() => readPreference('lang', ['en', 'fi'], 'en'))

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    savePreference('theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = lang
    savePreference('lang', lang)
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
