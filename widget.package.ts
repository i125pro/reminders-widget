import { WidgetPackage } from '@widget-js/core'

export default new WidgetPackage({
  author: '修改成你的信息',
  description: {
    'zh-CN': '提供 iPhone 风格的提醒事项（待办）组件，支持主题与显示项设置',
  },
  requiredAppVersion: '26.7.22',
  entry: '/',
  hash: true,
  remote: {
    base: '/',
    hostname: '修改成你的域名',
    hash: true,
  },
  homepage: '',
  name: 'com.github.reminders',
  title: {
    'zh-CN': '提醒事项组件包',
  },
  devOptions: {
    folder: './src/widgets/',
  },
})