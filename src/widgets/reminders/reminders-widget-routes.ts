import type { RouteObject } from 'react-router-dom'
import { createElement } from 'react'
import RemindersConfigView from './reminders-config-view'
import RemindersWidgetView from './reminders-widget-view'
import RemindersWidget from './reminders.widget'

const path = RemindersWidget.path
const name = RemindersWidget.name

const configPagePath = RemindersWidget.configPage!.path

const RemindersWidgetRoutes: RouteObject[] = [
  {
    path,
    id: `${name}`,
    element: createElement(RemindersWidgetView),
  },
  {
    path: configPagePath,
    id: `${name}.config`,
    element: createElement(RemindersConfigView),
  },
]

export default RemindersWidgetRoutes