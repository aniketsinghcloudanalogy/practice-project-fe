"use client";

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Button from '@/components/common/Button'

const Navbar = () => {
  const { status } = useSession()
  const isLoggedIn = status === 'authenticated'

  return (
    <header className="w-full border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-4 px-4 py-3 sm:flex-row sm:items-center sm:gap-6 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="text-left text-lg font-semibold tracking-tight text-slate-900 transition-colors hover:text-slate-600 sm:text-xl"
        >
          Practise Project
        </Link>

        <div className="flex w-full flex-col gap-3 sm:ml-auto sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          {isLoggedIn ? (
            <Button variant="auth" className="w-full sm:w-auto">
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