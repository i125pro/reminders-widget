import { Widget, WidgetKeyword } from '@widget-js/core'

const TodoWidget = new Widget({
  name: '.todo',
  title: { 'zh-CN': '待办事项' },
  description: { 'zh-CN': 'iPhone 风格的待办清单，支持勾选、旗标与主题设置。' },
  keywords: [WidgetKeyword.RECOMMEND],
  lang: 'zh-CN',
  categories: ['productivity', 'utilities'],
  width: 4,
  height: 5,
  minWidth: 3,
  maxWidth: 8,
  minHeight: 3,
  maxHeight: 8,
  previewImage: '/preview_todo.png',
  path: '/widget/todo',
  configPage: {
    path: '/widget/config/todo',
    frame: true,
    transparent: false,
    width: 700,
    height: 800,
    resizable: true,
    maximizable: true,
    alwaysOnTop: false,
  },
  configPagePath: '/widget/config/todo?width=700&height=800&frame=true&transparent=false&resizable=true&maximizable=true',
})

export default TodoWidget
