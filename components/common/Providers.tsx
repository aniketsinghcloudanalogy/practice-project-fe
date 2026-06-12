"use client";

import type { ReactNode } from 'react'
import { App } from 'antd'
import { SessionProvider } from 'next-auth/react'
import { Provider as ReduxProvider } from 'react-redux'
import { MessageStyles } from '@/components/common/Message'
import { store } from '@/store/store'
import SessionGuard from '@/components/common/SessionGuard'

type ProvidersProps = {
  children: ReactNode
}

const Providers = ({ children }: ProvidersProps) => {
  return (
    <ReduxProvider store={store}>
      <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
        <App>
          <SessionGuard />
          <MessageStyles />
          {children}
        </App>
      </SessionProvider>
    </ReduxProvider>
  )
}

export default Providers
