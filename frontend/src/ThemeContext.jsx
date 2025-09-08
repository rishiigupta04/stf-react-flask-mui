import React, { createContext, useState, useMemo, useContext, useEffect } from 'react'
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material'

// Provide a default shape to avoid undefined returns for consumers outside the provider
const ThemeToggleContext = createContext({ toggleTheme: () => {}, mode: 'dark' })

export function useThemeToggle() {
  return useContext(ThemeToggleContext)
}

export function CustomThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem('theme') || 'dark' } catch { return 'dark' }
  })

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            primary: { main: '#4db6ac' },
            background: { default: '#f5f5f5', paper: '#fff' },
            text: { primary: '#000' }
          }
        : {
            primary: { main: '#81c784' },
            background: { default: '#0f1724', paper: '#071126' },
            text: { primary: '#fff' }
          })
    },
    typography: {
      // align MUI typography with the slightly reduced global font-size
      fontFamily: "'Euclid Circular B', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
      fontSize: 14,
      h3: { fontWeight: 800, fontSize: '2rem' },
      h4: { fontWeight: 700, fontSize: '1.5rem' },
      h5: { fontWeight: 700, fontSize: '1.15rem' },
      h6: { fontWeight: 700, fontSize: '1rem' },
      body1: { fontSize: '0.95rem' },
      body2: { fontSize: '0.9rem' }
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.3s, color 0.3s'
          }
        }
      }
    }
  }), [mode])

  const toggleTheme = () => {
    setMode(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  // Keep a data attribute on the document so global CSS can adapt without !important
  useEffect(() => {
    try { document.documentElement.setAttribute('data-theme', mode) } catch(e) {}
    try { localStorage.setItem('theme', mode) } catch(e) {}
  }, [mode])

  return (
    <ThemeToggleContext.Provider value={{ toggleTheme, mode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeToggleContext.Provider>
  )
}
