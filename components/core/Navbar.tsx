"use client";

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import Button from '@/components/common/Button'
import { logout } from '@/lib/api/auth.api'

const Navbar = () => {
  const router = useRouter()
  const { status, data: session } = useSession()
  const isLoggedIn = status === 'authenticated'
  const role = (session?.user as any)?.role as string | undefined
  const isAdminRole = role === 'ADMIN' || role === 'SUPER_ADMIN'

  const handleLogout = async () => {
    const token = session?.accessToken ?? ''
    await signOut({ redirect: false })
    if (token) { try { await logout(token); } catch (error) { console.error('Logout API Error:', error) } }
    router.push('/')
    router.refresh()
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-4 px-2 py-3 sm:flex-row sm:items-center sm:gap-6 sm:px-3 lg:px-4">
        <Link
          href="/"
          className="text-left text-lg font-semibold tracking-tight text-slate-900 transition-colors hover:text-slate-600 sm:text-xl"
        >
          Practise Project
        </Link>

        <div className="flex w-full flex-col gap-3 sm:ml-auto sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          <Button variant="secondary" href="/contact" className="w-full sm:w-auto">
            Contact Us
          </Button>
          {isLoggedIn ? (
            <>
              <Button
                variant="auth"
                href={isAdminRole ? '/admin' : '/dashboard'}
                className="w-full sm:w-auto"
              >
                {isAdminRole ? 'Admin Panel' : 'Dashboard'}
              </Button>
              <Button variant="logout" className="w-full sm:w-auto" onClick={handleLogout}>
                Logout
              </Button>
            </>
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
