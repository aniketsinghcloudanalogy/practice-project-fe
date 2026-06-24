import { baseApi } from '../baseApi'
import type {
	AddQuoteFilesPayload,
	CreateQuotePayload,
	QuoteDetail,
	QuoteDetailResponse,
	QuoteListItem,
	QuoteListResponse,
	QuoteMutationData,
	QuoteMutationResponse,
} from './types'

const buildQuoteFormData = (files: File[], name?: string) => {
	const formData = new FormData()

	if (typeof name === 'string') {
		formData.append('name', name)
	}

	files.forEach((file) => {
		formData.append('pdfs', file)
	})

	return formData
}

const quoteListTags = (result: QuoteListItem[] | undefined) =>
	result
		? [
			  { type: 'Quote' as const, id: 'LIST' },
			  ...result.map((quote) => ({ type: 'Quote' as const, id: quote.id })),
		  ]
		: [{ type: 'Quote' as const, id: 'LIST' }]

const quoteDetailTags = (quoteId: string, result?: QuoteDetail | null) => [
	{ type: 'Quote' as const, id: 'LIST' },
	{ type: 'Quote' as const, id: quoteId },
	...(result?.quote?.id ? [{ type: 'Quote' as const, id: result.quote.id }] : []),
]

const quoteMutationTags = (quoteId?: string, result?: QuoteMutationData | null) => [
	{ type: 'Quote' as const, id: 'LIST' },
	...(quoteId ? [{ type: 'Quote' as const, id: quoteId }] : []),
	...(result?.quote?.id ? [{ type: 'Quote' as const, id: result.quote.id }] : []),
]

export const quoteApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getQuotes: builder.query<QuoteListItem[], void>({
			query: () => 'api/quotes',
			keepUnusedDataFor: 300,
			transformResponse: (response: QuoteListResponse) => response.data.quotes,
			providesTags: (result) => quoteListTags(result),
		}),
		getQuoteDetail: builder.query<QuoteDetail, string>({
			query: (quoteId) => `api/quotes/${quoteId}`,
			transformResponse: (response: QuoteDetailResponse) => response.data,
			providesTags: (_result, _error, quoteId) => quoteDetailTags(quoteId, _result),
		}),
		createQuote: builder.mutation<QuoteMutationData, CreateQuotePayload>({
			query: ({ name, files }) => ({
				url: 'api/quotes',
				method: 'POST',
				body: buildQuoteFormData(files, name),
			}),
			transformResponse: (response: QuoteMutationResponse) => response.data,
			invalidatesTags: (result) => quoteMutationTags(result?.quote?.id, result),
		}),
		addQuoteFiles: builder.mutation<QuoteMutationData, AddQuoteFilesPayload>({
			query: ({ quoteId, files }) => ({
				url: `api/quotes/${quoteId}/files`,
				method: 'POST',
				body: buildQuoteFormData(files),
			}),
			transformResponse: (response: QuoteMutationResponse) => response.data,
			invalidatesTags: (result, _error, arg) => quoteMutationTags(arg.quoteId, result),
		}),
	}),
	overrideExisting: false,
})

export const {
	useGetQuotesQuery,
	useGetQuoteDetailQuery,
	useCreateQuoteMutation,
	useAddQuoteFilesMutation,
} = quoteApi
