import { baseApi } from '../baseApi'
import type {
    PdfDocument,
    PdfTable,
    ExtractedData,
    StructuredExtractedData,
    MultiTableExtractedData,
    ApiResponse,
    UploadPdfSummary,
    MergedExtractedData,
    CreatePdfTablePayload,
    UpdatePdfTablePayload,
    CreatePdfTableRowPayload,
    UpdatePdfTableRowPayload,
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
        getPdfTables: builder.query<PdfTable[], string>({
            query: (id) => `api/pdfs/${id}/tables`,
            keepUnusedDataFor: 300,
            transformResponse: (response: ApiResponse<PdfTable[]>) => response.data,
            providesTags: (result, _error, id) =>
                result
                    ? [
                          { type: 'Pdfs' as const, id: `TABLES-${id}` },
                          { type: 'Pdfs' as const, id: `PDF-${id}` },
                          ...result.map((table) => ({ type: 'Pdfs' as const, id: table.id })),
                      ]
                    : [
                          { type: 'Pdfs' as const, id: `TABLES-${id}` },
                          { type: 'Pdfs' as const, id: `PDF-${id}` },
                      ],
        }),
        getMergedExtractedData: builder.query<MergedExtractedData, void>({
            query: () => 'api/pdfs/merged-data',
            keepUnusedDataFor: 300,
            transformResponse: (response: ApiResponse<MergedExtractedData>) => response.data,
            providesTags: (result) =>
                result
                    ? [{ type: 'Pdfs' as const, id: 'MERGED' }]
                    : [{ type: 'Pdfs' as const, id: 'MERGED' }],
        }),
        uploadPdf: builder.mutation<ApiResponse<UploadPdfSummary>, File>({
            query: (file) => {
                const formData = new FormData()
                formData.append('pdf', file)

                return {
                    url: 'api/pdfs/upload',
                    method: 'POST',
                    body: formData,
                }
            },
            invalidatesTags: [{ type: 'Pdfs' as const, id: 'LIST' }, { type: 'Pdfs' as const, id: 'MERGED' }],
        }),
        createPdfTable: builder.mutation<ApiResponse<PdfTable>, CreatePdfTablePayload>({
            query: ({ pdfDocumentId, ...body }) => ({
                url: `api/pdfs/${pdfDocumentId}/tables`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (result, _error, arg) => [
                { type: 'Pdfs' as const, id: `TABLES-${arg.pdfDocumentId}` },
                { type: 'Pdfs' as const, id: `PDF-${arg.pdfDocumentId}` },
                { type: 'Pdfs' as const, id: 'LIST' },
                { type: 'Pdfs' as const, id: 'MERGED' },
                ...(result?.data?.id ? [{ type: 'Pdfs' as const, id: result.data.id }] : []),
            ],
        }),
        updatePdfTable: builder.mutation<ApiResponse<PdfTable>, UpdatePdfTablePayload>({
            query: ({ tableId, ...body }) => ({
                url: `api/pdfs/tables/${tableId}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: (result, _error, arg) => [
                { type: 'Pdfs' as const, id: result?.data?.pdfDocumentId ? `TABLES-${result.data.pdfDocumentId}` : `TABLES-${arg.tableId}` },
                { type: 'Pdfs' as const, id: result?.data?.pdfDocumentId ? `PDF-${result.data.pdfDocumentId}` : `PDF-${arg.tableId}` },
                { type: 'Pdfs' as const, id: 'LIST' },
                { type: 'Pdfs' as const, id: 'MERGED' },
                ...(result?.data?.id ? [{ type: 'Pdfs' as const, id: result.data.id }] : []),
            ],
        }),
        replacePdfTable: builder.mutation<ApiResponse<PdfTable>, UpdatePdfTablePayload>({
            query: ({ tableId, ...body }) => ({
                url: `api/pdfs/tables/${tableId}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (result, _error, arg) => [
                { type: 'Pdfs' as const, id: result?.data?.pdfDocumentId ? `TABLES-${result.data.pdfDocumentId}` : `TABLES-${arg.tableId}` },
                { type: 'Pdfs' as const, id: result?.data?.pdfDocumentId ? `PDF-${result.data.pdfDocumentId}` : `PDF-${arg.tableId}` },
                { type: 'Pdfs' as const, id: 'LIST' },
                { type: 'Pdfs' as const, id: 'MERGED' },
                ...(result?.data?.id ? [{ type: 'Pdfs' as const, id: result.data.id }] : []),
            ],
        }),
        deletePdfTable: builder.mutation<ApiResponse<PdfTable>, string>({
            query: (tableId) => ({
                url: `api/pdfs/tables/${tableId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, _error, tableId) => [
                { type: 'Pdfs' as const, id: result?.data?.pdfDocumentId ? `TABLES-${result.data.pdfDocumentId}` : `TABLES-${tableId}` },
                { type: 'Pdfs' as const, id: result?.data?.pdfDocumentId ? `PDF-${result.data.pdfDocumentId}` : `PDF-${tableId}` },
                { type: 'Pdfs' as const, id: 'LIST' },
                { type: 'Pdfs' as const, id: 'MERGED' },
                ...(result?.data?.id ? [{ type: 'Pdfs' as const, id: result.data.id }] : []),
            ],
        }),
        createPdfTableRow: builder.mutation<ApiResponse<Record<string, any>>, CreatePdfTableRowPayload>({
            query: ({ tableId, rowData }) => ({
                url: `api/pdfs/tables/${tableId}/rows`,
                method: 'POST',
                body: { rowData },
            }),
            invalidatesTags: (result, _error, arg) => [
                { type: 'Pdfs' as const, id: `TABLES-${arg.tableId}` },
                { type: 'Pdfs' as const, id: 'MERGED' },
                ...(result?.data?.pdfDocumentId ? [{ type: 'Pdfs' as const, id: `PDF-${result.data.pdfDocumentId}` }] : []),
            ],
        }),
        updatePdfTableRow: builder.mutation<ApiResponse<Record<string, any>>, UpdatePdfTableRowPayload>({
            query: ({ tableId, rowId, rowData }) => ({
                url: `api/pdfs/tables/${tableId}/rows/${rowId}`,
                method: 'PATCH',
                body: { rowData },
            }),
            invalidatesTags: (result, _error, arg) => [
                { type: 'Pdfs' as const, id: `TABLES-${arg.tableId}` },
                { type: 'Pdfs' as const, id: 'MERGED' },
                ...(result?.data?.pdfDocumentId ? [{ type: 'Pdfs' as const, id: `PDF-${result.data.pdfDocumentId}` }] : []),
            ],
        }),
        deletePdfTableRow: builder.mutation<ApiResponse<Record<string, any>>, { tableId: string; rowId: string }>({
            query: ({ tableId, rowId }) => ({
                url: `api/pdfs/tables/${tableId}/rows/${rowId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, _error, arg) => [
                { type: 'Pdfs' as const, id: `TABLES-${arg.tableId}` },
                { type: 'Pdfs' as const, id: 'MERGED' },
                ...(result?.data?.pdfDocumentId ? [{ type: 'Pdfs' as const, id: `PDF-${result.data.pdfDocumentId}` }] : []),
            ],
        }),
        clearPdfTableRows: builder.mutation<ApiResponse<Record<string, any>>, string>({
            query: (tableId) => ({
                url: `api/pdfs/tables/${tableId}/rows`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, _error, tableId) => [
                { type: 'Pdfs' as const, id: `TABLES-${tableId}` },
                { type: 'Pdfs' as const, id: 'MERGED' },
                ...(result?.data?.pdfDocumentId ? [{ type: 'Pdfs' as const, id: `PDF-${result.data.pdfDocumentId}` }] : []),
            ],
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
    }),
    overrideExisting: false,
})

export const {
    useGetUserPdfsQuery,
    useGetPdfByIdQuery,
    useGetPdfTablesQuery,
    useGetMergedExtractedDataQuery,
    useUploadPdfMutation,
    useCreatePdfTableMutation,
    useUpdatePdfTableMutation,
    useReplacePdfTableMutation,
    useDeletePdfTableMutation,
    useCreatePdfTableRowMutation,
    useUpdatePdfTableRowMutation,
    useDeletePdfTableRowMutation,
    useClearPdfTableRowsMutation,
    useDeletePdfMutation,
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