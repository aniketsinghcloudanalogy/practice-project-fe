import { baseApi } from '../baseApi'

interface DealRegSubmitPayload {
    partnerId: number
    programId: number
    response: string[]
    clientUrl: string
}

interface DealRegSubmitResponse {
    success: boolean
    fieldsMapped?: number
    message?: string
}

export const dealRegApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        submitDealReg: builder.mutation<DealRegSubmitResponse, DealRegSubmitPayload>({
            query: (payload) => ({
                url: '/api/dealreg/submit',
                method: 'POST',
                body: payload,
            }),
            transformResponse: (response: DealRegSubmitResponse) => response,
        }),
    }),
    overrideExisting: process.env.NODE_ENV === 'development',
})

export const { useSubmitDealRegMutation } = dealRegApi
