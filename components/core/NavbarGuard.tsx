"use client"

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import Navbar from './Navbar'

type Props = {
  children: ReactNode
}

export default function NavbarGuard({ children }: Props) {
  const pathname = usePathname() ?? ''

  const hideOn = ['/login', '/signup']
  const shouldHide = hideOn.includes(pathname) || pathname.startsWith('/dashboard')

  return (
    <>
      {!shouldHide && <Navbar />}
      {children}
    </>
  )
}
