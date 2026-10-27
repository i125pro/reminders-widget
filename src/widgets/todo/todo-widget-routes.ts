import type { RouteObject } from 'react-router-dom'
import { createElement } from 'react'
import TodoWidgetView from './todo-widget-view'
import TodoConfigView from './todo-config-view'
import TodoWidget from './todo.widget'

const TodoWidgetRoutes: RouteObject[] = [
  {
    path: TodoWidget.path,
    id: `${TodoWidget.name}`,
    element: createElement(TodoWidgetView),
  },
  {
    path: TodoWidget.configPage!.path,
    id: `${TodoWidget.name}.config`,
    element: createElement(TodoConfigView),
  },
]

export default TodoWidgetRoutes
