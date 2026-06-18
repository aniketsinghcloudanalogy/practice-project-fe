import type { AiPdfLineItemFieldOption, AiPdfSyncTableInput, AiPdfSyncPayload } from './types'

export const LINE_ITEM_FIELD_OPTIONS = [
    { key: 'lineNumber', label: 'Line Number' },
    { key: 'itemCode', label: 'Item Code' },
    { key: 'employeeId', label: 'Employee ID' },
    { key: 'employeeName', label: 'Employee Name' },
    { key: 'description', label: 'Description' },
    { key: 'department', label: 'Department' },
    { key: 'category', label: 'Category' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'salary', label: 'Salary' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'unitPrice', label: 'Unit Price' },
    { key: 'amount', label: 'Amount' },
    { key: 'currency', label: 'Currency' },
    { key: 'status', label: 'Status' },
    { key: 'referenceNo', label: 'Reference No' },
    { key: 'location', label: 'Location' },
    { key: 'notes', label: 'Notes' },
] as const satisfies AiPdfLineItemFieldOption[]

export const LINE_ITEM_FIELD_KEYS = new Set(
    LINE_ITEM_FIELD_OPTIONS.map((f) => f.key)
)

// Run this before dispatching syncAiPdfUpload — backend trusts the shape now
export const normalizeSyncPayload = (tables: AiPdfSyncTableInput[]): AiPdfSyncPayload => ({
    tables: tables.map((table, _ti) => ({
        ...table,
        columns: Array.isArray(table.columns) ? table.columns : [],
        rows: Array.isArray(table.rows)
            ? table.rows.map((row, i) => ({
                id: row.id,
                rowData: row.rowData && typeof row.rowData === 'object' ? row.rowData : {},
                rowIndex: typeof row.rowIndex === 'number' ? row.rowIndex : i,
            }))
            : [],
        lineItemMapping: Object.fromEntries(
            Object.entries(table.lineItemMapping ?? {}).filter(
                ([, v]) => LINE_ITEM_FIELD_KEYS.has(v)
            )
        ),
    })),
})