import { baseApi } from '../baseApi'
import type {
  AiPdfUploadListItem,
  AiPdfUpload,
  AiPdfExtractSummary,
  AiPdfUploadListResponse,
  AiPdfUploadDetailResponse,
  AiPdfExtractResponse,
} from './types'

export const aiPdfApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // GET /aipdf — list all uploads with table count
    getAiPdfUploads: builder.query<AiPdfUploadListItem[], void>({
      query: () => 'api/aipdf',
      keepUnusedDataFor: 300,
      transformResponse: (response: AiPdfUploadListResponse) =>
        response.data.uploads,
      providesTags: (result) =>
        result
          ? [
              { type: 'Pdfs' as const, id: 'AI-PDF-LIST' },
              ...result.map((u) => ({ type: 'Pdfs' as const, id: `AI-PDF-${u.id}` })),
            ]
          : [{ type: 'Pdfs' as const, id: 'AI-PDF-LIST' }],
    }),

    // GET /aipdf/:uploadId — full detail with tables + rows
    getAiPdfUploadDetail: builder.query<AiPdfUpload, string>({
      query: (uploadId) => `api/aipdf/${uploadId}`,
      transformResponse: (response: AiPdfUploadDetailResponse) =>
        response.data.upload,
      providesTags: (_result, _error, uploadId) => [
        { type: 'Pdfs' as const, id: `AI-PDF-${uploadId}` },
        { type: 'Pdfs' as const, id: 'AI-PDF-LIST' },
      ],
    }),

    // POST /aipdf/extract — upload PDF and extract tables
    extractAiPdf: builder.mutation<AiPdfExtractSummary, File>({
      query: (file) => {
        const formData = new FormData()
        formData.append('pdf', file)

        return {
          url: 'api/aipdf/extract',
          method: 'POST',
          body: formData,
        }
      },
      transformResponse: (response: AiPdfExtractResponse) => response.data,
      invalidatesTags: [{ type: 'Pdfs' as const, id: 'AI-PDF-LIST' }],
    }),

  }),
  overrideExisting: true,
})

export const {
  useGetAiPdfUploadsQuery,
  useGetAiPdfUploadDetailQuery,
  useExtractAiPdfMutation,
} = aiPdfApi