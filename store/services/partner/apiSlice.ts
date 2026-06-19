import { baseApi } from '../baseApi'
import type {
    Partner,
    PartnerData,
    PartnerStats,
    PartnerProgram,
    PartnerProgramData,
    PartnerRow,
    ApiResponse,
} from '../types'

export const partnerApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // ─── Partner Management ─────────────────────────────────────────────────

        getPartners: builder.query<{ partners: PartnerRow[]; total: number; page: number; limit: number }, { page?: number; limit?: number; search?: string }>({
            query: (params = {}) => ({
                url: '/api/partners/all-with-programs',
                params: { page: params.page ?? 1, limit: params.limit ?? 10, search: params.search ?? '' },
            }),
            keepUnusedDataFor: 300,
            transformResponse: (response: ApiResponse<{ partners?: any[]; total?: number; page?: number; limit?: number } | any[]>) => {
                const raw = response.data
                // Handle both paginated response and legacy flat array
                const isLegacy = Array.isArray(raw)
                const partners = isLegacy ? raw : (Array.isArray(raw?.partners) ? raw.partners : [])
                const total = isLegacy ? partners.length : (raw?.total ?? 0)
                const page = isLegacy ? 1 : (raw?.page ?? 1)
                const limit = isLegacy ? partners.length : (raw?.limit ?? 10)
                return {
                    partners: partners.map((p: any) => ({
                        Id: p.Id ?? p.id,
                        "External id": p["External id"] ?? p.externalId ?? null,
                        "partner Name": p["partner Name"] ?? p.partnerName ?? null,
                        "parent Partner": p["parent Partner"] ?? p.parentPartner ?? null,
                        "PM Id": p["PM Id"] ?? p.pmId ?? null,
                        url: p.url ?? null,
                        email: p.email ?? null,
                        programs: Array.isArray(p.programs) ? p.programs : [],
                    })) as PartnerRow[],
                    total,
                    page,
                    limit,
                }
            },
            providesTags: (result) =>
                result?.partners
                    ? [
                          { type: 'Partner' as const, id: 'LIST' },
                          ...result.partners.map((partner) => ({ type: 'Partner' as const, id: partner.Id })),
                      ]
                    : [{ type: 'Partner' as const, id: 'LIST' }],
        }),

        getPartnerCount: builder.query<{ count: number }, void>({
            query: () => '/api/partners/count',
            transformResponse: (response: ApiResponse<{ count?: number; total?: number }>) => {
                const d = response.data || {}
                return { count: d.count ?? d.total ?? 0 }
            },
            providesTags: [{ type: 'Partner' as const, id: 'COUNT' }],
        }),

        getPartnerStats: builder.query<PartnerStats, void>({
            query: () => '/api/partners/stats',
            transformResponse: (response: ApiResponse<PartnerStats>) => 
                response.data || { totalPartners: 0, totalPrograms: 0, pending: 0 },
            providesTags: [{ type: 'Partner' as const, id: 'STATS' }],
        }),

        addPartner: builder.mutation<ApiResponse<Partner>, PartnerData>({
            query: (body) => ({
                url: '/api/partners/addpartner',
                method: 'POST',
                body,
            }),
            invalidatesTags: [
                { type: 'Partner' as const, id: 'LIST' },
                { type: 'Partner' as const, id: 'COUNT' },
                { type: 'Partner' as const, id: 'STATS' },
            ],
        }),

        updatePartner: builder.mutation<ApiResponse<Partner>, { partnerId: number; body: Partial<PartnerData> }>({
            query: ({ partnerId, body }) => ({
                url: `/api/partners/partners/${partnerId}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: (_result, _error, { partnerId }) => [
                { type: 'Partner' as const, id: partnerId },
                { type: 'Partner' as const, id: 'LIST' },
                { type: 'Partner' as const, id: 'STATS' },
            ],
        }),

        deletePartner: builder.mutation<ApiResponse<null>, number>({
            query: (partnerId) => ({
                url: `/api/partners/partners/${partnerId}`,
                method: 'DELETE',
            }),
            invalidatesTags: [
                { type: 'Partner' as const, id: 'LIST' },
                { type: 'Partner' as const, id: 'COUNT' },
                { type: 'Partner' as const, id: 'STATS' },
                { type: 'PartnerProgram' as const, id: 'LIST' },
            ],
        }),

        // ─── Partner Programs ───────────────────────────────────────────────────

        getPartnerPrograms: builder.query<{ programs: (PartnerProgram & { formStatus?: 'DRAFT' | 'SUBMITTED' | null; formCreatorId?: string | null })[] }, number>({
            query: (partnerId) => ({
                url: '/api/partners/programs',
                params: { partnerId },
            }),
            transformResponse: (response: ApiResponse<{ partner?: any; total?: number; programs?: any[] }>) => {
                const data = response.data || {}
                return { programs: Array.isArray(data.programs) ? data.programs : [] }
            },
            providesTags: (result, _error, partnerId) =>
                result?.programs
                    ? [
                          { type: 'PartnerProgram' as const, id: 'LIST' },
                          { type: 'PartnerProgram' as const, id: `PARTNER-${partnerId}` },
                          ...result.programs.map((program) => ({ type: 'PartnerProgram' as const, id: program.id })),
                      ]
                    : [
                          { type: 'PartnerProgram' as const, id: 'LIST' },
                          { type: 'PartnerProgram' as const, id: `PARTNER-${partnerId}` },
                      ],
        }),

        getPartnerProgramById: builder.query<PartnerProgram & { partnerName?: string }, number>({
            query: (programId) => `/api/partners/programs/${programId}`,
            transformResponse: (response: ApiResponse<PartnerProgram & { partnerName?: string }>) => response.data,
            providesTags: (_result, _error, programId) => [
                { type: 'PartnerProgram' as const, id: programId },
            ],
        }),

        addProgram: builder.mutation<ApiResponse<PartnerProgram>, PartnerProgramData>({
            query: (body) => ({
                url: '/api/partners/addprogram',
                method: 'POST',
                body,
            }),
            invalidatesTags: [
                { type: 'Partner' as const, id: 'LIST' },
                { type: 'PartnerProgram' as const, id: 'LIST' },
                { type: 'Partner' as const, id: 'STATS' },
            ],
        }),

        updateProgram: builder.mutation<ApiResponse<PartnerProgram>, { programId: number; body: { partnerProgramName?: string; description?: string | null } }>({
            query: ({ programId, body }) => ({
                url: `/api/partners/programs/${programId}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: (_result, _error, { programId }) => [
                { type: 'PartnerProgram' as const, id: programId },
                { type: 'PartnerProgram' as const, id: 'LIST' },
            ],
        }),

        updateVerificationStep: builder.mutation<ApiResponse<PartnerProgram>, { programId: number; verificationStep: boolean }>({
            query: ({ programId, verificationStep }) => ({
                url: `/api/partners/programs/${programId}/verification`,
                method: 'PATCH',
                body: { verificationStep },
            }),
            async onQueryStarted({ programId, verificationStep }, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled
                    
                    // Update the program in all related queries
                    dispatch(
                        partnerApi.util.updateQueryData('getPartnerPrograms', undefined as any, (draft) => {
                            if (draft?.programs) {
                                const program = draft.programs.find((p) => p.id === programId)
                                if (program) {
                                    program.verificationStep = verificationStep
                                }
                            }
                        }),
                    )
                } catch {
                    // Let endpoint consumer handle mutation failure UI
                }
            },
            invalidatesTags: (_result, _error, { programId }) => [
                { type: 'PartnerProgram' as const, id: programId },
            ],
        }),

        deleteProgram: builder.mutation<ApiResponse<null>, number>({
            query: (programId) => ({
                url: `/api/partners/programs/${programId}`,
                method: 'DELETE',
            }),
            invalidatesTags: [
                { type: 'Partner' as const, id: 'LIST' },
                { type: 'PartnerProgram' as const, id: 'LIST' },
                { type: 'Partner' as const, id: 'STATS' },
                { type: 'ProgramForm' as const, id: 'LIST' },
            ],
        }),
    }),
    overrideExisting: process.env.NODE_ENV === 'development',
})

export const {
    useGetPartnersQuery,
    useGetPartnerCountQuery,
    useGetPartnerStatsQuery,
    useAddPartnerMutation,
    useUpdatePartnerMutation,
    useDeletePartnerMutation,
    useGetPartnerProgramsQuery,
    useGetPartnerProgramByIdQuery,
    useAddProgramMutation,
    useUpdateProgramMutation,
    useUpdateVerificationStepMutation,
    useDeleteProgramMutation,
} = partnerApi