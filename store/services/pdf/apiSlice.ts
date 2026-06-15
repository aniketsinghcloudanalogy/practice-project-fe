import { baseApi } from '../baseApi'
import type {
    PdfDocument,
    UpdateExtractedDataPayload,
    ExtractedData,
    StructuredExtractedData,
    MultiTableExtractedData,
    ApiResponse,
} from '../types'

export const pdfApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getUserPdfs: builder.query<PdfDocument[], void>({
            query: () => 'api/pdfs',
            keepUnusedDataFor: 300,
            transformResponse: (response: ApiResponse<PdfDocument[]>) => response.data,
            providesTags: (result) =>
                result
                    ? [
                          { type: 'Pdfs' as const, id: 'LIST' },
                          ...result.map((pdf) => ({ type: 'Pdfs' as const, id: pdf.id })),
                      ]
                    : [{ type: 'Pdfs' as const, id: 'LIST' }],
        }),
        getPdfById: builder.query<PdfDocument, string>({
            query: (id) => `api/pdfs/${id}`,
            transformResponse: (response: ApiResponse<PdfDocument>) => response.data,
            providesTags: (_result, _error, id) => [{ type: 'Pdfs' as const, id }],
        }),
        uploadPdf: builder.mutation<ApiResponse<PdfDocument>, File>({
            query: (file) => {
                const formData = new FormData()
                formData.append('pdf', file)

                return {
                    url: 'api/pdfs/upload',
                    method: 'POST',
                    body: formData,
                }
            },
            async onQueryStarted(_file, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled
                    const createdPdf = data?.data
                    if (!createdPdf) return

                    dispatch(
                        pdfApi.util.updateQueryData('getUserPdfs', undefined, (draft) => {
                            const exists = draft.some((pdf) => pdf.id === createdPdf.id)
                            if (!exists) {
                                draft.unshift(createdPdf)
                            }
                        }),
                    )
                } catch {
                    // Let endpoint consumer handle mutation failure UI.
                }
            },
            invalidatesTags: [{ type: 'Pdfs' as const, id: 'LIST' }],
        }),
        deletePdf: builder.mutation<ApiResponse<PdfDocument>, string>({
            query: (id) => ({
                url: `api/pdfs/${id}`,
                method: 'DELETE',
            }),
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    pdfApi.util.updateQueryData('getUserPdfs', undefined, (draft) => {
                        const index = draft.findIndex((pdf) => pdf.id === id)
                        if (index !== -1) {
                            draft.splice(index, 1)
                        }
                    }),
                )

                try {
                    await queryFulfilled
                } catch {
                    patchResult.undo()
                }
            },
            invalidatesTags: (_result, _error, id) => [{ type: 'Pdfs' as const, id }],
        }),
        updatePdfExtractedData: builder.mutation<ApiResponse<PdfDocument>, UpdateExtractedDataPayload>({
            query: ({ id, extractedData }) => ({
                url: `api/pdfs/${id}/extracted-data`,
                method: 'PATCH',
                body: { extractedData },
            }),
            async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled
                    const updatedPdf = data?.data
                    if (!updatedPdf) return

                    dispatch(
                        pdfApi.util.updateQueryData('getUserPdfs', undefined, (draft) => {
                            const index = draft.findIndex((pdf) => pdf.id === id)
                            if (index !== -1) {
                                draft[index] = updatedPdf
                            }
                        }),
                    )
                } catch {
                    // Let endpoint consumer handle mutation failure UI.
                }
            },
            invalidatesTags: (_result, _error, arg) => [{ type: 'Pdfs' as const, id: arg.id }],
        }),
        clearPdfExtractedData: builder.mutation<ApiResponse<PdfDocument>, string>({
            query: (id) => ({
                url: `api/pdfs/${id}/extracted-data`,
                method: 'DELETE',
            }),
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled
                    const clearedPdf = data?.data

                    dispatch(
                        pdfApi.util.updateQueryData('getUserPdfs', undefined, (draft) => {
                            const index = draft.findIndex((pdf) => pdf.id === id)
                            if (index === -1) return

                            draft[index] = clearedPdf
                                ? clearedPdf
                                : { ...draft[index], extractedData: null }
                        }),
                    )
                } catch {
                    // Let endpoint consumer handle mutation failure UI.
                }
            },
            invalidatesTags: (_result, _error, id) => [{ type: 'Pdfs' as const, id }],
        }),
    }),
    overrideExisting: false,
})

export const {
    useGetUserPdfsQuery,
    useGetPdfByIdQuery,
    useUploadPdfMutation,
    useDeletePdfMutation,
    useUpdatePdfExtractedDataMutation,
    useClearPdfExtractedDataMutation,
} = pdfApi

export const isStructuredExtractedData = (
    data: ExtractedData | null | undefined,
): data is StructuredExtractedData => {
    return Boolean(
        data &&
            !Array.isArray(data) &&
            typeof data === 'object' &&
            'columns' in data &&
            'rows' in data &&
            Array.isArray((data as StructuredExtractedData).columns) &&
            Array.isArray((data as StructuredExtractedData).rows),
    )
}

export const isMultiTableExtractedData = (
    data: ExtractedData | null | undefined,
): data is MultiTableExtractedData => {
    return Boolean(
        data &&
            !Array.isArray(data) &&
            typeof data === 'object' &&
            'tables' in data &&
            Array.isArray((data as MultiTableExtractedData).tables) &&
            (data as MultiTableExtractedData).tables.every((table) =>
                Array.isArray(table.columns) && Array.isArray(table.rows),
            ),
    )
}
