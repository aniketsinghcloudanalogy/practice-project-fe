"use client";

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import Button from '@/components/common/Button'
import { logout } from '@/lib/api/auth.api'

const Navbar = () => {
  const router = useRouter()
  const pathname = usePathname() ?? ''
  const { status } = useSession()
  const isLoggedIn = status === 'authenticated'

  const handleLogout = async () => {
    await signOut({ redirect: false })

    try {
      await logout()
    } catch (error) {
      console.error('Logout API Error:', error)
    }

    router.push('/login')
    router.refresh()
  }

  return (
    <header className="relative z-20 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div
        className="mx-auto flex w-full max-w-360 flex-col gap-4 px-4 py-3 sm:flex-row sm:items-center sm:gap-6 sm:px-6 lg:px-8"
        style={{ paddingLeft: 'var(--navbar-offset)' }}
      >
        <Link
          href="/dashboard"
          className="text-left text-lg font-semibold tracking-tight text-slate-900 transition-colors hover:text-slate-600 sm:text-xl"
        >
          Practise Project
        </Link>

        <div className="flex w-full flex-col gap-3 sm:ml-auto sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          {isLoggedIn ? (
            <Button variant="auth" className="w-full sm:w-auto" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <>
              <Button href="/login" variant="auth" className="w-full sm:w-auto">
                Login
              </Button>
              <Button href="/signup" variant="signin" className="w-full sm:w-auto">
                Signup
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
