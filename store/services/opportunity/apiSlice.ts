import { baseApi } from '../baseApi';
import type { Opportunity, OpportunityPayload, ApiResponse } from '../types';

export const opportunityApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getOpportunities: builder.query<Opportunity[], string | void>({
            query: (customerId) =>
                customerId ? `/api/opportunities?customerId=${customerId}` : '/api/opportunities',
            keepUnusedDataFor: 300,
            transformResponse: (response: ApiResponse<Opportunity[]>) =>
                Array.isArray(response.data) ? response.data : [],
            providesTags: (result) =>
                result
                    ? [
                          { type: 'Opportunity' as const, id: 'LIST' },
                          ...result.map((o) => ({ type: 'Opportunity' as const, id: o.id })),
                      ]
                    : [{ type: 'Opportunity' as const, id: 'LIST' }],
        }),

        getOpportunity: builder.query<Opportunity, string>({
            query: (opportunityId) => `/api/opportunities/${opportunityId}`,
            transformResponse: (response: ApiResponse<Opportunity>) => response.data as Opportunity,
            providesTags: (_result, _error, id) => [{ type: 'Opportunity' as const, id }],
        }),

        createOpportunity: builder.mutation<ApiResponse<Opportunity>, OpportunityPayload>({
            query: (body) => ({ url: '/api/opportunities', method: 'POST', body }),
            invalidatesTags: [{ type: 'Opportunity' as const, id: 'LIST' }],
        }),

        updateOpportunity: builder.mutation<ApiResponse<Opportunity>, { id: string; body: Partial<OpportunityPayload> }>({
            query: ({ id, body }) => ({ url: `/api/opportunities/${id}`, method: 'PATCH', body }),
            async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    const updated = data?.data;
                    if (!updated) return;
                    dispatch(
                        opportunityApi.util.updateQueryData('getOpportunities', undefined, (draft) => {
                            const index = draft.findIndex((o) => o.id === id);
                            if (index !== -1) draft[index] = updated;
                        }),
                    );
                } catch {}
            },
            invalidatesTags: (_result, _error, arg) => [{ type: 'Opportunity' as const, id: arg.id }],
        }),

        deleteOpportunity: builder.mutation<ApiResponse<null>, string>({
            query: (id) => ({ url: `/api/opportunities/${id}`, method: 'DELETE' }),
            invalidatesTags: ['Opportunity'],
        }),
    }),
    overrideExisting: process.env.NODE_ENV === 'development',
});

export const {
    useGetOpportunitiesQuery,
    useGetOpportunityQuery,
    useCreateOpportunityMutation,
    useUpdateOpportunityMutation,
    useDeleteOpportunityMutation,
} = opportunityApi;
