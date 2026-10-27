import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import '@widget-js/react/style.css'
import '@/assets/main.css'

const container = document.getElementById('root')

if (!container) {
  throw new Error('Root container #root was not found.')
}

createRoot(container).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
