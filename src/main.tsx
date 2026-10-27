import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import ErrorBoundary from '@/components/error-boundary'
import { collectSnapshot, installConsoleForwarding, installGlobalErrorHandlers, rlog } from '@/utils/renderer-log'
import '@widget-js/react/style.css'
import '@/assets/main.css'

installGlobalErrorHandlers()
installConsoleForwarding()

rlog('main: bootstrap start snapshot=', JSON.stringify(collectSnapshot()))

const container = document.getElementById('root')
rlog('main: #root found=', Boolean(container))

if (!container) {
  throw new Error('Root container #root was not found.')
}

createRoot(container).render(
  <StrictMode>
    <HashRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </HashRouter>
  </StrictMode>,
)

rlog('main: createRoot.render invoked')

window.setTimeout(() => {
  rlog('main: after first frame href=', window.location.href, 'snapshot=', JSON.stringify(collectSnapshot()))
}, 0)
