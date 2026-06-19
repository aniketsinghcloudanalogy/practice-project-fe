import { baseApi } from '../baseApi'
import type {
    UserRow,
    ApiResponse,
} from '../types'

export const userApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // ─── Get Users (Admin) ──────────────────────────────────────────────────

        getUsers: builder.query<UserRow[], void>({
            query: () => '/api/users/list',
            transformResponse: (response: ApiResponse<UserRow[]>) => response.data || [],
            providesTags: (result) =>
                result
                    ? [
                          { type: 'User' as const, id: 'LIST' },
                          ...result.map((user) => ({ type: 'User' as const, id: user.id })),
                      ]
                    : [{ type: 'User' as const, id: 'LIST' }],
        }),

        // ─── Toggle User Active Status ──────────────────────────────────────────

        toggleUserActive: builder.mutation<ApiResponse<UserRow>, { userId: string; isActive: boolean }>({
            query: ({ userId, isActive }) => ({
                url: `/api/users/${userId}/active`,
                method: 'PATCH',
                body: { isActive },
            }),
            async onQueryStarted({ userId, isActive }, { dispatch, queryFulfilled }) {
                // Optimistic update
                const patchResult = dispatch(
                    userApi.util.updateQueryData('getUsers', undefined, (draft) => {
                        const user = draft.find((u) => u.id === userId)
                        if (user) {
                            user.isActive = isActive
                        }
                    }),
                )

                try {
                    const { data } = await queryFulfilled
                    const updatedUser = data?.data

                    if (!updatedUser) return

                    // Update with actual response data
                    dispatch(
                        userApi.util.updateQueryData('getUsers', undefined, (draft) => {
                            const index = draft.findIndex((user) => user.id === userId)
                            if (index !== -1) {
                                draft[index] = updatedUser
                            }
                        }),
                    )
                } catch {
                    patchResult.undo()
                }
            },
            invalidatesTags: (_result, _error, { userId }) => [
                { type: 'User' as const, id: userId },
            ],
        }),
    }),
    overrideExisting: process.env.NODE_ENV === 'development',
})

export const {
    useGetUsersQuery,
    useToggleUserActiveMutation,
} = userApi