import type { RouteObject } from 'react-router-dom'
import { createElement } from 'react'
import ClockConfigView from './clock-config-view'
import ClockWidgetView from './clock-widget-view'
import ClockWidget from './clock.widget'

const path = ClockWidget.path
const name = ClockWidget.name

const configPagePath = ClockWidget.configPage!.path

const ClockWidgetRoutes: RouteObject[] = [
  {
    path,
    id: `${name}`,
    element: createElement(ClockWidgetView),
  },
  {
    path: configPagePath,
    id: `${name}.config`,
    element: createElement(ClockConfigView),
  },
]

export default ClockWidgetRoutes
