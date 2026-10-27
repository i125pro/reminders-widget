import { LogApi } from '@widget-js/core'

const PREFIX = '[todo]'
const CONSOLE_PREFIX = `${PREFIX} console`

let errorCount = 0
let globalsInstalled = false
let consoleInstalled = false

export function getErrorCount(): number {
  return errorCount
}

export function safeSerialize(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }
  if (value === undefined) {
    return 'undefined'
  }
  if (value === null) {
    return 'null'
  }
  if (typeof value !== 'object') {
    return String(value)
  }
  try {
    return JSON.stringify(value)
  }
  catch {
    return Object.prototype.toString.call(value)
  }
}

function joinArgs(args: unknown[]): string {
  return args.map(safeSerialize).join(' ')
}

function emit(method: 'info' | 'warn' | 'error' | 'log', args: unknown[]) {
  try {
    LogApi[method](PREFIX, joinArgs(args))
  }
  catch {
    void 0
  }
}

export function rlog(...args: unknown[]) {
  emit('info', args)
}

export function rwarn(...args: unknown[]) {
  emit('warn', args)
}

export function rerror(...args: unknown[]) {
  errorCount += 1
  emit('error', args)
}

export interface RouteInfo {
  hash: string
  path: string
  params: Record<string, string>
}

export function parseRoute(): RouteInfo {
  const hash = window.location.hash || ''
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  const [pathPart, queryPart] = raw.split('?')
  const params: Record<string, string> = {}
  try {
    new URLSearchParams(queryPart || '').forEach((value, key) => {
      params[key] = value
    })
  }
  catch {
    void 0
  }
  return { hash, path: pathPart || '(none)', params }
}

export function collectSnapshot(extra: Record<string, unknown> = {}): Record<string, unknown> {
  let root: HTMLElement | null = null
  try {
    root = document.getElementById('root')
  }
  catch {
    root = null
  }
  return {
    href: window.location.href,
    route: parseRoute(),
    readyState: document.readyState,
    rootFound: Boolean(root),
    rootHtmlLength: root ? root.innerHTML.length : -1,
    errorCount,
    ...extra,
  }
}

export function installGlobalErrorHandlers() {
  if (globalsInstalled) {
    return
  }
  globalsInstalled = true
  try {
    window.addEventListener('error', (event) => {
      const detailed = event as ErrorEvent
      rerror(
        'window.onerror:',
        detailed.message,
        'file=',
        detailed.filename,
        'line=',
        detailed.lineno,
        'stack=',
        detailed.error instanceof Error ? detailed.error.stack ?? '' : '',
      )
    })
    window.addEventListener('unhandledrejection', (event) => {
      const reason = (event as PromiseRejectionEvent).reason
      rerror(
        'unhandledrejection:',
        safeSerialize(reason),
        'stack=',
        reason instanceof Error ? reason.stack ?? '' : '',
      )
    })
  }
  catch {
    void 0
  }
}

export function installConsoleForwarding() {
  if (consoleInstalled) {
    return
  }
  consoleInstalled = true
  try {
    const originalError = console.error.bind(console)
    const originalWarn = console.warn.bind(console)
    let forwarding = false

    const wrappedError = (...args: unknown[]) => {
      if (!forwarding) {
        forwarding = true
        try {
          emit('error', [CONSOLE_PREFIX, 'error', ...args])
        }
        finally {
          forwarding = false
        }
      }
      originalError(...args)
    }

    const wrappedWarn = (...args: unknown[]) => {
      if (!forwarding) {
        forwarding = true
        try {
          emit('warn', [CONSOLE_PREFIX, 'warn', ...args])
        }
        finally {
          forwarding = false
        }
      }
      originalWarn(...args)
    }

    console.error = wrappedError
    console.warn = wrappedWarn
  }
  catch {
    void 0
  }
}
