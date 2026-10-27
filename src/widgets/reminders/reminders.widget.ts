import { Widget, WidgetKeyword } from '@widget-js/core'

const RemindersWidget = new Widget({
  name: '.reminders',
  title: { 'zh-CN': '提醒事项' },
  description: { 'zh-CN': 'iPhone 风格的待办清单，支持筛选、旗标与主题设置。' },
  keywords: [WidgetKeyword.RECOMMEND],
  lang: 'zh-CN',
  width: 4,
  height: 5,
  minWidth: 3,
  maxWidth: 8,
  minHeight: 3,
  maxHeight: 8,
  previewImage: '/preview_reminders.png',
  path: '/widget/reminders',
  configPage: {
    path: '/widget/config/reminders',
    frame: true,
    transparent: false,
    width: 700,
    height: 800,
    resizable: true,
    maximizable: true,
    alwaysOnTop: false,
  },
})

export default RemindersWidget