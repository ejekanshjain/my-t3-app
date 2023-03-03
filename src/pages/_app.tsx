import type { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import type { AppType } from 'next/app'
import { Router } from 'next/router'
import NProgress from 'nprogress'
import { api } from '~/utils/api'
import '../styles/globals.css'

Router.events.on('routeChangeStart', () => NProgress.start())
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps }
}) => {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}

export default api.withTRPC(MyApp)
