import { useEffect } from 'react'
import { useLocation, useRoutes } from 'react-router-dom'
import HomePage from '@/pages/home-page'
import { widgetRoutes } from '@/widgets/widget-router'
import { rlog } from '@/utils/renderer-log'

const registeredPaths = widgetRoutes.map(route => route.path ?? '(unset)')

export default function App() {
  const location = useLocation()

  useEffect(() => {
    rlog(
      'app: location pathname=',
      location.pathname,
      'search=',
      location.search,
      'hash=',
      location.hash,
      'href=',
      window.location.href,
    )
    rlog('app: registered widget route paths=', JSON.stringify(registeredPaths))
  }, [location.pathname, location.search, location.hash])

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
