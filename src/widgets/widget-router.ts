import type { RouteObject } from 'react-router-dom'
import ClockWidgetRoutes from './clock/clock-widget-routes'
import ClockWidget from './clock/clock.widget'
import TodoWidgetRoutes from './todo/todo-widget-routes'
import TodoWidget from './todo/todo.widget'

export const widgets = [
  ClockWidget,
  TodoWidget,
]

export const widgetRoutes: RouteObject[] = [
  ...ClockWidgetRoutes,
  ...TodoWidgetRoutes,
]
