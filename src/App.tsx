import { useRoutes } from 'react-router-dom'
import HomePage from '@/pages/home-page'
import { widgetRoutes } from '@/widgets/widget-router'

export default function App() {
  return useRoutes([
    {
      path: '/',
      element: <HomePage />,
    },
    ...widgetRoutes,
    {
      path: '*',
      element: <HomePage />,
    },
  ])
}
