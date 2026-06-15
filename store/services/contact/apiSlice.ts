import { baseApi } from '../baseApi'
import type {
    Contact,
    ContactPayload,
    ContactMessagePayload,
    ApiResponse,
} from '../types'

export const contactApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getContacts: builder.query<Contact[], void>({
            query: () => '/api/users/me/contacts',
            keepUnusedDataFor: 300,
            transformResponse: (response: ApiResponse<Contact[] | { contacts?: Contact[] }>) => {
                const payload = response.data as { contacts?: Contact[] } | Contact[] | undefined
                if (Array.isArray(payload)) return payload
                return payload?.contacts ?? []
            },
            providesTags: (result) =>
                result
                    ? [
                          { type: 'Contact' as const, id: 'LIST' },
                          ...result.map((contact) => ({ type: 'Contact' as const, id: contact.id })),
                      ]
                    : [{ type: 'Contact' as const, id: 'LIST' }],
        }),
        getContact: builder.query<Contact, string>({
            query: (contactId) => `/api/contacts/${contactId}`,
            transformResponse: (response: ApiResponse<Contact>) => response.data as Contact,
            providesTags: (_result, _error, contactId) => [{ type: 'Contact' as const, id: contactId }],
        }),
        createContact: builder.mutation<ApiResponse<Contact>, ContactPayload>({
            query: (body) => ({
                url: '/api/contacts',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'Contact' as const, id: 'LIST' }],
        }),
        updateContact: builder.mutation<ApiResponse<Contact>, { id: string; body: Partial<ContactPayload> }>({
            query: ({ id, body }) => ({
                url: `/api/contacts/${id}`,
                method: 'PATCH',
                body,
            }),
            async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled
                    const updatedContact = data?.data

                    if (!updatedContact) return

                    dispatch(
                        contactApi.util.updateQueryData('getContacts', undefined, (draft) => {
                            const index = draft.findIndex((contact) => contact.id === id)
                            if (index !== -1) {
                                draft[index] = updatedContact
                            }
                        }),
                    )
                } catch {
                    // Let endpoint consumer handle mutation failure UI.
                }
            },
            invalidatesTags: (_result, _error, arg) => [{ type: 'Contact' as const, id: arg.id }],
        }),
        deleteContact: builder.mutation<ApiResponse<null>, string>({
            query: (contactId) => ({
                url: `/api/contacts/${contactId}`,
                method: 'DELETE',
            }),
            async onQueryStarted(contactId, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    contactApi.util.updateQueryData('getContacts', undefined, (draft) => {
                        return draft.filter((contact) => contact.id !== contactId)
                    }),
                )

                try {
                    await queryFulfilled
                } catch {
                    patchResult.undo()
                }
            },
            invalidatesTags: (_result, _error, contactId) => [{ type: 'Contact' as const, id: contactId }],
        }),
        submitContactMessage: builder.mutation<ApiResponse<unknown>, ContactMessagePayload>({
            query: (body) => ({
                url: '/api/contacts',
                method: 'POST',
                body,
            }),
        }),
    }),
    overrideExisting: false,
})

export const {
    useGetContactsQuery,
    useGetContactQuery,
    useCreateContactMutation,
    useUpdateContactMutation,
    useDeleteContactMutation,
    useSubmitContactMessageMutation,
} = contactApi
