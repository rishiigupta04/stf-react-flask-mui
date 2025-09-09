import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { CustomThemeProvider } from './ThemeContext'
      // also update when window 'load' fires (assets/images)
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CustomThemeProvider>
      <App />
    </CustomThemeProvider>
    </React.StrictMode>

)
