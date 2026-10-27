import { Link } from 'react-router-dom'
import { widgets } from '@/widgets/widget-router'

export default function HomePage() {
  return (
    <main className="home-page">
      <section className="hero-panel">
        <p className="eyebrow">WidgetJS React Example</p>
        <h1>Vue 示例已迁移为 React</h1>
        <p className="hero-copy">
          这个示例现在使用 Vite + React + TypeScript，并直接复用
          <code>@widget-js/react</code>
          提供的组件和 hooks。
        </p>
      </section>

      <section className="widget-grid">
        {widgets.map((widget) => {
          const title = widget.title?.['zh-CN'] ?? widget.name
          const widgetQuery = new URLSearchParams({
            w_id: 'demo-clock',
            w_name: widget.name,
            w_title: title,
            w_mode: '0',
          })

          const configPath = widget.configPagePath?.split('?')[0] ?? '/widget/config/clock'
          const configQuery = new URLSearchParams(widget.configPagePath?.split('?')[1] ?? '')

          configQuery.set('w_id', 'demo-clock')
          configQuery.set('w_name', widget.name)
          configQuery.set('w_title', title)
          configQuery.set('w_mode', '0')

          return (
            <article key={widget.name} className="widget-card">
              <div className="widget-card__body">
                <p className="widget-card__tag">React Widget</p>
                <h2>{title}</h2>
                <p>{widget.description?.['zh-CN'] ?? '一个最小可运行的 React 挂件示例。'}</p>
                <dl className="widget-meta">
                  <div>
                    <dt>Widget</dt>
                    <dd>{widget.path}</dd>
                  </div>
                  <div>
                    <dt>Config</dt>
                    <dd>{configPath}</dd>
                  </div>
                </dl>
              </div>
              <div className="widget-card__actions">
                <Link className="action-link action-link--primary" to={`${widget.path}?${widgetQuery.toString()}`}>
                  打开组件
                </Link>
                <Link className="action-link" to={`${configPath}?${configQuery.toString()}`}>
                  打开配置页
                </Link>
              </div>
            </article>
          )
        })}
      </section>
    </main>
  )
}
