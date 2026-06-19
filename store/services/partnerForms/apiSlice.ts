import { baseApi } from '../baseApi'
import type {
    ProgramForm,
    ApiResponse,
} from '../types'

export const partnerFormsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // ─── GET form by programId ──────────────────────────────────────────────

        getProgramForm: builder.query<ProgramForm | null, number>({
            query: (programId) => `/api/partners/forms/${programId}`,
            transformResponse: (response: ApiResponse<ProgramForm | null>) => response.data,
            providesTags: (_result, _error, programId) => [
                { type: 'ProgramForm' as const, id: programId },
                { type: 'ProgramForm' as const, id: 'LIST' },
            ],
        }),

        // ─── Save draft ─────────────────────────────────────────────────────────

        saveProgramFormDraft: builder.mutation<ApiResponse<ProgramForm>, { programId: number; formDesign: Record<string, unknown> }>({
            query: ({ programId, formDesign }) => ({
                url: `/api/partners/forms/${programId}/save`,
                method: 'POST',
                body: { formDesign },
            }),
            async onQueryStarted({ programId }, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled
                    const updatedForm = data?.data

                    if (!updatedForm) return

                    dispatch(
                        partnerFormsApi.util.updateQueryData('getProgramForm', programId, (draft) => {
                            return updatedForm
                        }),
                    )
                } catch {
                    // Let endpoint consumer handle mutation failure UI
                }
            },
            invalidatesTags: (_result, _error, { programId }) => [
                { type: 'ProgramForm' as const, id: programId },
            ],
        }),

        // ─── Submit form ────────────────────────────────────────────────────────

        submitProgramForm: builder.mutation<ApiResponse<ProgramForm>, { programId: number; formDesign: Record<string, unknown> }>({
            query: ({ programId, formDesign }) => ({
                url: `/api/partners/forms/${programId}/submit`,
                method: 'POST',
                body: { formDesign },
            }),
            async onQueryStarted({ programId }, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled
                    const updatedForm = data?.data

                    if (!updatedForm) return

                    dispatch(
                        partnerFormsApi.util.updateQueryData('getProgramForm', programId, (draft) => {
                            return updatedForm
                        }),
                    )
                } catch {
                    // Let endpoint consumer handle mutation failure UI
                }
            },
            invalidatesTags: (_result, _error, { programId }) => [
                { type: 'ProgramForm' as const, id: programId },
                { type: 'ProgramForm' as const, id: 'LIST' },
            ],
        }),

        // ─── Edit submitted form (super admin) ──────────────────────────────────

        editProgramForm: builder.mutation<ApiResponse<ProgramForm>, { programId: number; formDesign: Record<string, unknown> }>({
            query: ({ programId, formDesign }) => ({
                url: `/api/partners/forms/${programId}`,
                method: 'PATCH',
                body: { formDesign },
            }),
            async onQueryStarted({ programId }, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled
                    const updatedForm = data?.data

                    if (!updatedForm) return

                    dispatch(
                        partnerFormsApi.util.updateQueryData('getProgramForm', programId, (draft) => {
                            return updatedForm
                        }),
                    )
                } catch {
                    // Let endpoint consumer handle mutation failure UI
                }
            },
            invalidatesTags: (_result, _error, { programId }) => [
                { type: 'ProgramForm' as const, id: programId },
                { type: 'ProgramForm' as const, id: 'LIST' },
            ],
        }),

        // ─── Delete form (super admin) ──────────────────────────────────────────

        deleteProgramForm: builder.mutation<ApiResponse<ProgramForm>, number>({
            query: (programId) => ({
                url: `/api/partners/forms/${programId}`,
                method: 'DELETE',
            }),
            async onQueryStarted(programId, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    partnerFormsApi.util.updateQueryData('getProgramForm', programId, (draft) => {
                        return null
                    }),
                )

                try {
                    await queryFulfilled
                } catch {
                    patchResult.undo()
                }
            },
            invalidatesTags: (_result, _error, programId) => [
                { type: 'ProgramForm' as const, id: programId },
                { type: 'ProgramForm' as const, id: 'LIST' },
            ],
        }),

        // ─── Reopen form (give edit access back to creator) ─────────────────────

        reopenProgramForm: builder.mutation<ApiResponse<ProgramForm>, number>({
            query: (programId) => ({
                url: `/api/partners/forms/${programId}/reopen`,
                method: 'POST',
                body: {},
            }),
            async onQueryStarted(programId, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled
                    const updatedForm = data?.data

                    if (!updatedForm) return

                    dispatch(
                        partnerFormsApi.util.updateQueryData('getProgramForm', programId, (draft) => {
                            return updatedForm
                        }),
                    )
                } catch {
                    // Let endpoint consumer handle mutation failure UI
                }
            },
            invalidatesTags: (_result, _error, programId) => [
                { type: 'ProgramForm' as const, id: programId },
                { type: 'ProgramForm' as const, id: 'LIST' },
            ],
        }),
    }),
    overrideExisting: process.env.NODE_ENV === 'development',
})

export const {
    useGetProgramFormQuery,
    useSaveProgramFormDraftMutation,
    useSubmitProgramFormMutation,
    useEditProgramFormMutation,
    useDeleteProgramFormMutation,
    useReopenProgramFormMutation,
} = partnerFormsApi