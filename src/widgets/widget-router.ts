import type { RouteObject } from 'react-router-dom'
import ClockWidgetRoutes from './clock/clock-widget-routes'
import ClockWidget from './clock/clock.widget'
import RemindersWidgetRoutes from './reminders/reminders-widget-routes'
import RemindersWidget from './reminders/reminders.widget'

export const widgets = [
  ClockWidget,
  RemindersWidget,
]

export const widgetRoutes: RouteObject[] = [
  ...ClockWidgetRoutes,
  ...RemindersWidgetRoutes,
]