import { WidgetPackage } from '@widget-js/core'

export default new WidgetPackage({
  author: 'i125pro',
  description: {
    'zh-CN': '提供 iPhone 风格的桌面待办事项组件',
  },
  entry: 'index.html',
  hash: true,
  homepage: 'https://github.com/i125pro/reminders-widget',
  name: 'cn.todo.widget',
  title: {
    'zh-CN': '待办事项组件包',
  },
  devOptions: {
    folder: './src/widgets/',
  },
})
