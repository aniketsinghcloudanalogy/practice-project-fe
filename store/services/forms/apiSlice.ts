import { baseApi } from '../baseApi'
import type {
    FormSubmission,
    FormDraftPayload,
    FormSubmitPayload,
    FormFilters,
    ApiResponse,
} from '../types'

export const formsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // ─── Draft APIs ─────────────────────────────────────────────────────────

        saveDraft: builder.mutation<ApiResponse<FormSubmission>, FormDraftPayload>({
            query: (body) => ({
                url: '/api/forms/draft',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'Form' as const, id: 'LIST' }],
        }),

        updateDraft: builder.mutation<ApiResponse<FormSubmission>, { id: string; draftData: Record<string, unknown> }>({
            query: ({ id, draftData }) => ({
                url: `/api/forms/${id}/draft`,
                method: 'PATCH',
                body: { draftData },
            }),
            async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled
                    const updatedForm = data?.data

                    if (!updatedForm) return

                    dispatch(
                        formsApi.util.updateQueryData('getFormById', id, (draft) => {
                            return updatedForm
                        }),
                    )
                } catch {
                    // Let endpoint consumer handle mutation failure UI
                }
            },
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Form' as const, id },
            ],
        }),

        getDraft: builder.query<FormSubmission | null, { sessionId: string; formType: string }>({
            query: (params) => ({
                url: '/api/forms/draft',
                params,
            }),
            transformResponse: (response: ApiResponse<FormSubmission | null>) => response.data,
            providesTags: (_result, _error, { sessionId, formType }) => [
                { type: 'Form' as const, id: `DRAFT-${sessionId}-${formType}` },
            ],
        }),

        // ─── Submit APIs ────────────────────────────────────────────────────────

        submitDraft: builder.mutation<ApiResponse<FormSubmission>, { id: string; finalData?: Record<string, unknown> }>({
            query: ({ id, finalData }) => ({
                url: `/api/forms/${id}/submit`,
                method: 'POST',
                body: { finalData },
            }),
            async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled
                    const updatedForm = data?.data

                    if (!updatedForm) return

                    dispatch(
                        formsApi.util.updateQueryData('getFormById', id, (draft) => {
                            return updatedForm
                        }),
                    )
                } catch {
                    // Let endpoint consumer handle mutation failure UI
                }
            },
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Form' as const, id },
                { type: 'Form' as const, id: 'LIST' },
            ],
        }),

        directSubmit: builder.mutation<ApiResponse<FormSubmission>, FormSubmitPayload>({
            query: (body) => ({
                url: '/api/forms/submit',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'Form' as const, id: 'LIST' }],
        }),

        // ─── Read APIs ──────────────────────────────────────────────────────────

        getMySubmissions: builder.query<FormSubmission[], string>({
            query: (formType) => ({
                url: '/api/forms/my',
                params: { formType },
            }),
            transformResponse: (response: ApiResponse<FormSubmission[]>) => response.data || [],
            providesTags: (result, _error, formType) =>
                result
                    ? [
                          { type: 'Form' as const, id: 'LIST' },
                          { type: 'Form' as const, id: `MY-${formType}` },
                          ...result.map((form) => ({ type: 'Form' as const, id: form.id })),
                      ]
                    : [
                          { type: 'Form' as const, id: 'LIST' },
                          { type: 'Form' as const, id: `MY-${formType}` },
                      ],
        }),

        getFormById: builder.query<FormSubmission, string>({
            query: (id) => `/api/forms/${id}`,
            transformResponse: (response: ApiResponse<FormSubmission>) => response.data,
            providesTags: (_result, _error, id) => [{ type: 'Form' as const, id }],
        }),

        listSubmissions: builder.query<FormSubmission[], FormFilters | void>({
            query: (filters) => ({
                url: '/api/forms',
                params: filters || undefined,
            }),
            transformResponse: (response: ApiResponse<FormSubmission[]>) => response.data || [],
            providesTags: (result) =>
                result
                    ? [
                          { type: 'Form' as const, id: 'LIST' },
                          ...result.map((form) => ({ type: 'Form' as const, id: form.id })),
                      ]
                    : [{ type: 'Form' as const, id: 'LIST' }],
        }),

        // ─── Delete API ─────────────────────────────────────────────────────────

        deleteSubmission: builder.mutation<ApiResponse<null>, string>({
            query: (id) => ({
                url: `/api/forms/${id}`,
                method: 'DELETE',
            }),
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                const patchResults = [
                    dispatch(
                        formsApi.util.updateQueryData('listSubmissions', undefined, (draft) => {
                            return draft.filter((form) => form.id !== id)
                        }),
                    ),
                    dispatch(
                        formsApi.util.updateQueryData('listSubmissions', {} as FormFilters, (draft) => {
                            return draft.filter((form) => form.id !== id)
                        }),
                    ),
                ]

                try {
                    await queryFulfilled
                } catch {
                    patchResults.forEach((patch) => patch.undo())
                }
            },
            invalidatesTags: (_result, _error, id) => [
                { type: 'Form' as const, id },
                { type: 'Form' as const, id: 'LIST' },
            ],
        }),

        // ─── Reopen / Give Edit Access ──────────────────────────────────────────

        reopenForm: builder.mutation<ApiResponse<FormSubmission>, string>({
            query: (id) => ({
                url: `/api/forms/${id}/reopen`,
                method: 'POST',
                body: {},
            }),
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled
                    const updatedForm = data?.data

                    if (!updatedForm) return

                    dispatch(
                        formsApi.util.updateQueryData('getFormById', id, (draft) => {
                            return updatedForm
                        }),
                    )
                } catch {
                    // Let endpoint consumer handle mutation failure UI
                }
            },
            invalidatesTags: (_result, _error, id) => [
                { type: 'Form' as const, id },
                { type: 'Form' as const, id: 'LIST' },
            ],
        }),
    }),
    overrideExisting: process.env.NODE_ENV === 'development',
})

export const {
    useSaveDraftMutation,
    useUpdateDraftMutation,
    useGetDraftQuery,
    useSubmitDraftMutation,
    useDirectSubmitMutation,
    useGetMySubmissionsQuery,
    useGetFormByIdQuery,
    useListSubmissionsQuery,
    useDeleteSubmissionMutation,
    useReopenFormMutation,
} = formsApi