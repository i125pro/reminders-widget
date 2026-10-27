import { Widget, WidgetKeyword } from '@widget-js/core'

const ClockWidget = new Widget({
  name: '.clock',
  title: { 'zh-CN': '时钟' },
  description: { 'zh-CN': 'Hello world!' },
  keywords: [WidgetKeyword.RECOMMEND],
  lang: 'zh-CN',
  categories: ['utilities'],
  width: 3,
  height: 3,
  minWidth: 2,
  maxWidth: 6,
  minHeight: 2,
  maxHeight: 6,
  previewImage: '/preview_clock.png',
  path: '/widget/clock',
  configPage: {
    path: '/widget/config/clock',
    frame: true,
    transparent: false,
    width: 700,
    height: 800,
    resizable: true,
    maximizable: true,
    alwaysOnTop: false,
  },
  configPagePath: '/widget/config/clock?width=700&height=800&frame=true&transparent=false&resizable=true&maximizable=true',
})

export default ClockWidget
