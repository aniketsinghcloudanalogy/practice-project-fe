import { baseApi } from '../baseApi'
import type {
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
    BulkDeletePdfTableRowsPayload,
    BulkDeletePdfTableRowsResponse,
    UpdatePdfTableRowPayload,
    BulkUpdatePdfTableRowsPayload,
    BulkUpdatePdfTableRowsResponse,
} from '../types'

const isSoftDeleted = (entity: { isDeleted?: boolean } | null | undefined) => Boolean(entity?.isDeleted)

type BackendExtractedRow = {
    id: string
    rowIndex?: number | null
    rowHash?: string
    isDeleted?: boolean
    rowData?: Record<string, any>
}

type BackendPdfTable = PdfTable & {
    extractedRows?: BackendExtractedRow[]
}

const normalizeTableRows = (table: BackendPdfTable): PdfTable['rows'] => {
    if (Array.isArray(table.rows) && table.rows.length > 0) {
        return table.rows
    }

    if (!Array.isArray(table.extractedRows)) {
        return []
    }

    return table.extractedRows.map((row) => ({
        ...(row.rowData ?? {}),
        id: row.id,
        rowIndex: row.rowIndex,
        rowHash: row.rowHash,
        isDeleted: row.isDeleted,
    }))
}

const normalizeTable = (table: BackendPdfTable): PdfTable => ({
    ...table,
    rows: normalizeTableRows(table),
})

const normalizeTables = (tables: BackendPdfTable[] | undefined | null): PdfTable[] =>
    (Array.isArray(tables) ? tables : []).map((table) => normalizeTable(table))

const filterActiveRows = (rows: PdfTable['rows'] | undefined | null) =>
    (Array.isArray(rows) ? rows : []).filter((row) => !isSoftDeleted(row))

const filterActiveTables = (tables: PdfTable[]) =>
    (Array.isArray(tables) ? tables : [])
        .filter((table) => !isSoftDeleted(table))
        .map((table) => ({
            ...table,
            rows: filterActiveRows(table.rows),
        }))

const filterActiveMergedTables = (tables: MergedExtractedData['tables']) =>
    (Array.isArray(tables) ? tables : [])
        .filter((table) => !isSoftDeleted(table as { isDeleted?: boolean }))
        .map((table) => ({
            ...table,
            rows: (Array.isArray(table.rows) ? table.rows : []).filter(
                (row) => !isSoftDeleted(row as { isDeleted?: boolean }),
            ),
        }))

const tableListTags = (result: PdfTable[] | undefined, listId: string) =>
    result
        ? [
              { type: 'Pdfs' as const, id: listId },
              ...result.map((table) => ({ type: 'Pdfs' as const, id: table.id })),
          ]
        : [{ type: 'Pdfs' as const, id: listId }]

const tableScopedTags = (tableId: string, result?: PdfTable | null) => [
    { type: 'Pdfs' as const, id: `TABLES-${tableId}` },
    { type: 'Pdfs' as const, id: `PDF-${tableId}` },
    { type: 'Pdfs' as const, id: 'LIST' },
    { type: 'Pdfs' as const, id: 'MERGED' },
    ...(result?.id ? [{ type: 'Pdfs' as const, id: result.id }] : []),
]

export const pdfApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getUserPdfs: builder.query<PdfTable[], void>({
            query: () => 'api/pdfs',
            keepUnusedDataFor: 300,
            transformResponse: (response: ApiResponse<PdfTable[]>) =>
                filterActiveTables(normalizeTables(response.data as unknown as BackendPdfTable[])),
            providesTags: (result) => tableListTags(result, 'LIST'),
        }),
        getPdfById: builder.query<PdfTable, string>({
            query: (id) => `api/pdfs/tables/${id}`,
            transformResponse: (response: ApiResponse<PdfTable>) =>
                normalizeTable(response.data as unknown as BackendPdfTable),
            providesTags: (_result, _error, id) => [{ type: 'Pdfs' as const, id }],
        }),
        getPdfTables: builder.query<PdfTable[], void>({
            query: () => 'api/pdfs/tables',
            keepUnusedDataFor: 300,
            transformResponse: (response: ApiResponse<PdfTable[]>) =>
                filterActiveTables(normalizeTables(response.data as unknown as BackendPdfTable[])),
            providesTags: (result) => tableListTags(result, 'LIST'),
        }),
        getMergedExtractedData: builder.query<MergedExtractedData, void>({
            query: () => 'api/pdfs/merged-data',
            keepUnusedDataFor: 300,
            transformResponse: (response: ApiResponse<MergedExtractedData>) => ({
                ...response.data,
                tables: filterActiveMergedTables(response.data.tables ?? []),
            }),
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
            query: (body) => ({
                url: 'api/pdfs/tables',
                method: 'POST',
                body,
            }),
            invalidatesTags: (result) => tableScopedTags(result?.data?.id ?? 'LIST', result?.data),
        }),
        updatePdfTable: builder.mutation<ApiResponse<PdfTable>, UpdatePdfTablePayload>({
            query: ({ tableId, ...body }) => ({
                url: `api/pdfs/tables/${tableId}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: (result, _error, arg) => tableScopedTags(arg.tableId, result?.data),
        }),
        replacePdfTable: builder.mutation<ApiResponse<PdfTable>, UpdatePdfTablePayload>({
            query: ({ tableId, ...body }) => ({
                url: `api/pdfs/tables/${tableId}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (result, _error, arg) => tableScopedTags(arg.tableId, result?.data),
        }),
        deletePdfTable: builder.mutation<ApiResponse<PdfTable>, string>({
            query: (tableId) => ({
                url: `api/pdfs/tables/${tableId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, _error, tableId) => tableScopedTags(tableId, result?.data),
        }),
        createPdfTableRow: builder.mutation<ApiResponse<Record<string, any>>, CreatePdfTableRowPayload>({
            query: ({ tableId, rowData }) => ({
                url: `api/pdfs/tables/${tableId}/rows`,
                method: 'POST',
                body: { rowData },
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: 'Pdfs' as const, id: arg.tableId },
                { type: 'Pdfs' as const, id: 'LIST' },
                { type: 'Pdfs' as const, id: 'MERGED' },
            ],
        }),
        updatePdfTableRow: builder.mutation<ApiResponse<Record<string, any>>, UpdatePdfTableRowPayload>({
            query: ({ tableId, rowId, rowData }) => ({
                url: `api/pdfs/tables/${tableId}/rows/${rowId}`,
                method: 'PATCH',
                body: { rowData },
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: 'Pdfs' as const, id: arg.tableId },
                { type: 'Pdfs' as const, id: 'LIST' },
                { type: 'Pdfs' as const, id: 'MERGED' },
            ],
        }),
        bulkUpdateRows: builder.mutation<BulkUpdatePdfTableRowsResponse, any>({
            query: (payload) => {
                const { tableId, ...body } = payload ?? {};
                return {
                    url: `api/pdfs/tables/${tableId}/rows/bulk`,
                    method: 'PATCH',
                    body,
                };
            },
            transformResponse: (response: ApiResponse<BulkUpdatePdfTableRowsResponse>) =>
                response.data,
            invalidatesTags: (_result, _error, arg) => [
                { type: 'Pdfs' as const, id: arg.tableId },
                { type: 'Pdfs' as const, id: 'LIST' },
                { type: 'Pdfs' as const, id: 'MERGED' },
            ],
        }),
        bulkDeleteRows: builder.mutation<BulkDeletePdfTableRowsResponse, BulkDeletePdfTableRowsPayload>({
            query: ({ tableId, rowIds }) => ({
                url: `api/pdfs/tables/${tableId}/rows/bulk`,
                method: 'DELETE',
                body: { rowIds },
            }),
            transformResponse: (response: ApiResponse<BulkDeletePdfTableRowsResponse>) =>
                response.data,
            invalidatesTags: (_result, _error, arg) => [
                { type: 'Pdfs' as const, id: arg.tableId },
                { type: 'Pdfs' as const, id: 'LIST' },
                { type: 'Pdfs' as const, id: 'MERGED' },
            ],
        }),
        deletePdfTableRow: builder.mutation<ApiResponse<Record<string, any>>, { tableId: string; rowId: string }>({
            query: ({ tableId, rowId }) => ({
                url: `api/pdfs/tables/${tableId}/rows/${rowId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: 'Pdfs' as const, id: arg.tableId },
                { type: 'Pdfs' as const, id: 'LIST' },
                { type: 'Pdfs' as const, id: 'MERGED' },
            ],
        }),
        clearPdfTableRows: builder.mutation<ApiResponse<Record<string, any>>, string>({
            query: (tableId) => ({
                url: `api/pdfs/tables/${tableId}/rows`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, tableId) => [
                { type: 'Pdfs' as const, id: tableId },
                { type: 'Pdfs' as const, id: 'LIST' },
                { type: 'Pdfs' as const, id: 'MERGED' },
            ],
        }),
    }),
    overrideExisting: true,
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
    useBulkUpdateRowsMutation,
    useBulkDeleteRowsMutation,
    useDeletePdfTableRowMutation,
    useClearPdfTableRowsMutation,
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
