import '../lib/dayjs'
import type { AppProps } from 'next/app'
import { globalStyles } from '../styles/global'
import { SessionProvider } from 'next-auth/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../lib/react-query'

globalStyles()
export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  // desestruturação do pageProps e de dentro dele caso exista uma session retira ela, e o resto continua sendo pageprops
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </QueryClientProvider>
  )
}
