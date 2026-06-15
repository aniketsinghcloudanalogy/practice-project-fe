import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getSession } from 'next-auth/react'

const baseURL = process.env.NEXT_PUBLIC_NODE_API_URL || 'http://localhost:4000'

const rawBaseQuery = fetchBaseQuery({
    baseUrl: baseURL,
})

const baseQueryWithAuth = async (...args: Parameters<typeof rawBaseQuery>) => {
    const [request, api, extraOptions] = args
    const session = await getSession()
    const accessToken = session?.accessToken
    const headersInit = typeof request === 'string' ? undefined : (request.headers as HeadersInit | undefined)
    const headers = new Headers(headersInit)

    if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`)
    }

    const preparedRequest =
        typeof request === 'string'
            ? { url: request, headers }
            : { ...request, headers }

    return rawBaseQuery(preparedRequest, api, extraOptions)
}

export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithAuth,
    tagTypes: ['Contact', 'Pdfs'],
    endpoints: () => ({}),
})

export default baseApi
