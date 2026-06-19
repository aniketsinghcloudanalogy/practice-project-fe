'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

/**
 * Legacy /formBuilder route — redirects to /superAdminPartner/formBuilder
 */
export default function FormBuilderRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const params = searchParams.toString()
    router.replace(`/superAdminPartner/formBuilder${params ? `?${params}` : ''}`)
  }, [router, searchParams])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 80px)' }}>
      <div style={{ textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>Redirecting…</div>
      </div>
    </div>
  )
}
