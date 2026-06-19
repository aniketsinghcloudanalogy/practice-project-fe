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
  const appShellPrefixes = ['/admin', '/superAdminPartner', '/formBuilder', '/dashboard', '/contact',"/adminPartner","/dealRegAi"]
  const shouldHide =
    hideOn.includes(pathname) ||
    appShellPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )

  return (
    <>
      {!shouldHide && (
        <>
          <Navbar />
          <div className="shrink-0 pt-[var(--navbar-height)]" aria-hidden="true" />
        </>
      )}
      {children}
    </>
  )
}
