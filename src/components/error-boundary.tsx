import type { CSSProperties, ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'
import { collectSnapshot, rerror, safeSerialize } from '@/utils/renderer-log'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
  componentStack: string
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  display: 'grid',
  placeItems: 'center',
  padding: '24px',
  background: 'rgba(28, 28, 30, 0.92)',
  color: '#fff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
  overflow: 'auto',
}

const cardStyle: CSSProperties = {
  width: '100%',
  maxWidth: '720px',
  padding: '20px 22px',
  border: '1px solid rgba(255, 69, 58, 0.6)',
  borderRadius: '14px',
  background: 'rgba(44, 44, 46, 0.96)',
}

const titleStyle: CSSProperties = {
  margin: '0 0 8px',
  fontSize: '18px',
  fontWeight: 700,
  color: '#ff453a',
}

const messageStyle: CSSProperties = {
  margin: '0 0 12px',
  fontSize: '14px',
  fontWeight: 600,
  wordBreak: 'break-word',
}

const preStyle: CSSProperties = {
  margin: '0 0 12px',
  padding: '10px 12px',
  borderRadius: '8px',
  background: 'rgba(0, 0, 0, 0.4)',
  fontSize: '12px',
  lineHeight: 1.5,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  overflow: 'auto',
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, componentStack: '' }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const componentStack = info.componentStack ?? ''
    this.setState({ componentStack })
    rerror(
      'ErrorBoundary caught:',
      error.message,
      'stack=',
      error.stack ?? '',
      'componentStack=',
      componentStack,
      'snapshot=',
      safeSerialize(collectSnapshot()),
    )
  }

  render() {
    const { error, componentStack } = this.state
    if (!error) {
      return this.props.children
    }
    const stackLines = (error.stack ?? '').split('\n')
    const componentLines = componentStack.split('\n').filter(line => line.trim().length > 0)
    return (
      <div style={overlayStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>渲染层发生错误</h1>
          <p style={messageStyle}>{error.message}</p>
          <pre style={preStyle}>{stackLines.slice(0, 8).join('\n')}</pre>
          <pre style={preStyle}>{componentLines.slice(0, 6).join('\n')}</pre>
        </div>
      </div>
    )
  }
}
