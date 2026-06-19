'use client'

import React, { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import type { FormSchema } from '@/components/formBuilder/types'
import { useGetProgramFormQuery } from '@/store/services'
import { useGetPartnerProgramByIdQuery } from '@/store/services/partner/apiSlice'

const FormBuilder = dynamic(
  () => import('@/components/formBuilder/FormBuilder'),
  { ssr: false }
)

export default function FormBuilderPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const role = session?.user?.role ?? ''
  const formId = searchParams.get('formid')
  const programId = formId ? Number(formId) : null

  const { data: formData, isLoading: loading, error } = useGetProgramFormQuery(programId!, {
    skip: !programId,
  });

  const { data: programData, isLoading: programLoading } = useGetPartnerProgramByIdQuery(programId!, {
    skip: !programId,
  });

  const [initialSchema, setInitialSchema] = useState<FormSchema | null>(null)
  const [formStatus, setFormStatus] = useState<'DRAFT' | 'SUBMITTED' | null>(null)

  const isSuperAdmin = role === 'SUPER_ADMIN'

  // Update state when form data changes
  React.useEffect(() => {
    if (formData) {
      setFormStatus(formData.status)
      // Load draft design for editing, or submitted design for view
      const design = formData.status === 'DRAFT'
        ? formData.formDesign
        : formData.submittedDesign ?? formData.formDesign
      if (design) setInitialSchema(design as unknown as FormSchema)
    }
  }, [formData]);

  // Handle error state
  const errorMessage = React.useMemo(() => {
    if (!error) return null;
    
    const status = (error as any)?.status;
    if (status === 403) {
      return (error as any)?.data?.message || 'You do not have access to this form.';
    }
    if (status !== 404 && status !== 500) {
      console.error('Failed to load form:', error);
    }
    return null;
  }, [error]);

  // Show loading state
  if (loading || programLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 80px)' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Loading form builder…</div>
        </div>
      </div>
    )
  }

  // Show error if no program ID provided
  if (!programId) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 80px)' }}>
        <div style={{ textAlign: 'center', padding: '40px 24px', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', maxWidth: 420 }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>No Partner Program Selected</div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Please select a partner program to create or edit a form.</div>
          <button
            onClick={() => router.push('/superAdminPartner')}
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Go to Partner Programs
          </button>
        </div>
      </div>
    )
  }

  // Block non-super-admin from accessing the form builder
  if (!isSuperAdmin) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 80px)' }}>
        <div style={{ textAlign: 'center', padding: '40px 24px', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', maxWidth: 420 }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>🔒</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>Access Denied</div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Only super admins can access the form builder.</div>
          <button
            onClick={() => window.history.back()}
            style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 80px)' }}>
        <div style={{ textAlign: 'center', padding: '40px 24px', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', maxWidth: 420 }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>🔒</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>Access Denied</div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>{errorMessage}</div>
          <button
            onClick={() => window.history.back()}
            style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--navbar-height, 64px) - 24px)' }}>
      {/* Partner Program Context Header */}
      {programData && (
        <div style={{
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: 13,
          color: '#64748b',
          flexShrink: 0,
        }}>
          <button
            onClick={() => router.push('/superAdminPartner')}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              cursor: 'pointer',
              textDecoration: 'none',
              fontSize: 13,
            }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
          >
            Partner Programs
          </button>
          <span>/</span>
          <span style={{ fontWeight: 500, color: '#374151' }}>
            {programData.partnerName && <span style={{ color: '#64748b' }}>{programData.partnerName} • </span>}
            {programData.partnerProgramName}
          </span>
          <span>/</span>
          <span style={{ fontWeight: 500, color: '#374151' }}>Form Builder</span>
        </div>
      )}

      {/* Form Builder */}
      <div style={{
        flex: 1,
        overflow: 'hidden',
        margin: programData ? '0 -16px -32px -16px' : '-24px -16px -32px -16px',
        borderRadius: 12,
      }}>
        <FormBuilder
          programId={programId}
          role={role}
          formStatus={formStatus}
          initialForm={initialSchema ?? undefined}
          onStatusChange={setFormStatus}
          readOnly={false}
        />
      </div>
    </div>
  )
}
