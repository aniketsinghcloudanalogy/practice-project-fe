"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftOutlined, CloseOutlined, DeleteOutlined, EditOutlined, FilePdfOutlined, MoreOutlined, PlusOutlined, SaveOutlined } from "@/components/common/antd/icons";
import Button from "@/components/common/Button";
import Dropdown from "@/components/common/Dropdown";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Table from "@/components/common/Table";
import type { ColumnsType } from "@/components/common/antd/Table";
import message from "@/components/common/Message";
import Modal from "@/components/common/Modal";
import { StyledPdfDetailsPage } from "@/components/pdf/PdfDetails.styles";
import {
	useClearPdfTableRowsMutation,
	useCreatePdfTableRowMutation,
	useBulkUpdateRowsMutation,
	useBulkDeleteRowsMutation,
	useDeletePdfTableMutation,
	useDeletePdfTableRowMutation,
	useGetPdfTablesQuery,
	useGetPdfByIdQuery,
	useUpdatePdfTableRowMutation,
} from "@/store/services/pdf/apiSlice";
import type { PdfColumn, PdfTable, PdfTableRow } from "@/store/services/types";
import type { MenuProps } from "antd";

type EditableRow = PdfTableRow & { __rowKey: string; __isNew?: boolean };

type EditableTableGroup = {
	id: string;
	key: string;
	title: string;
	columns: PdfColumn[];
	rows: EditableRow[];
	index: number;
	sourceFileName?: string | null;
	schemaHash: string;
	tableHash: string;
};

type BulkEditFieldDraft = {
	id: string;
	columnKey: string | null;
	value: string;
};

const EMPTY_PDF_TABLES: PdfTable[] = [];

const inferColumnsFromRows = (rows: Record<string, unknown>[] = []): PdfColumn[] => {
	const keys = new Set<string>();
	const ignoredKeys = new Set(["__rowKey", "__isNew", "id", "rowIndex", "rowHash", "pdfDocumentId", "tableId", "isDeleted"]);

	rows.forEach((row) => {
		Object.keys(row).forEach((key) => {
			if (!ignoredKeys.has(key)) {
				keys.add(key);
			}
		});
	});

	return Array.from(keys).map((key) => ({
		title: key
			.replace(/([a-z])([A-Z])/g, "$1 $2")
			.replace(/[_-]+/g, " ")
			.replace(/^./, (char) => char.toUpperCase()),
		key,
		dataType: "string",
	}));
};

const buildEditableRows = (rows: PdfTableRow[] | undefined): EditableRow[] =>
	(rows ?? [])
		.filter((row) => !row.isDeleted)
		.map((row, index) => ({
			...row,
			__rowKey: String(row.id ?? index),
		}));

const stripEditableRowKey = (row: EditableRow) => {
	const {
		__rowKey: omittedRowKey,
		__isNew: omittedIsNew,
		id: omittedId,
		rowIndex: omittedRowIndex,
		rowHash: omittedRowHash,
		...nextRow
	} = row;

	void omittedRowKey;
	void omittedIsNew;
	void omittedId;
	void omittedRowIndex;
	void omittedRowHash;

	return nextRow;
};

const formatSourceName = (sourceName: string) => {
	return sourceName
		.replace(/\.pdf$/i, "")
		.replace(/[_-]+/g, " ")
		.replace(/\s+/g, " ")
		.trim();
};

const getDisplayTableTitle = (
	title: string | null | undefined,
	sourceFileName: string | null | undefined,
	fallbackTitle: string,
) => {
	const normalizedTitle = typeof title === "string" ? title.trim() : "";
	const genericTableTitlePattern = /^table\s+\d+$/i;

	if (normalizedTitle && !genericTableTitlePattern.test(normalizedTitle)) {
		return normalizedTitle;
	}

	if (typeof sourceFileName === "string" && sourceFileName.trim().length > 0) {
		return formatSourceName(sourceFileName);
	}

	return fallbackTitle;
};

const getTableTitle = (table: PdfTable, index: number) => {
	return getDisplayTableTitle(table.title, table.sourceFileName, `Table ${index + 1}`);
};

const buildTableGroups = (tables: PdfTable[] | undefined): EditableTableGroup[] => {
	return (tables ?? [])
		.filter((table) => !table.isDeleted)
		.map((table, tableIndex) => {
		const rows = buildEditableRows(table.rows).map((row) => ({
			...row,
			__rowKey: String(row.id),
		}));

		return {
			id: table.id,
			key: table.id,
			title: getTableTitle(table, tableIndex),
			columns: table.columns.length > 0 ? table.columns : inferColumnsFromRows(rows),
			rows,
			index: tableIndex,
			sourceFileName: table.sourceFileName,
			schemaHash: table.schemaHash,
			tableHash: table.tableHash,
		};
	});
};

const getErrorMessage = (error: unknown, fallback: string) => {
	if (typeof error === "string") {
		return error;
	}

	if (error && typeof error === "object") {
		const maybeError = error as { message?: unknown; data?: { message?: unknown } };
		if (typeof maybeError.data?.message === "string") {
			return maybeError.data.message;
		}
		if (typeof maybeError.message === "string") {
			return maybeError.message;
		}
	}

	return fallback;
};

const renderCell = (value: unknown) => {
	if (value === null || value === undefined || value === "") {
		return <span className="text-slate-400">-</span>;
	}

	if (typeof value === "number") {
		return <span className="font-medium text-slate-900">{value.toLocaleString()}</span>;
	}

	return <span className="text-slate-700">{String(value)}</span>;
};

const getRowIdentity = (row: EditableRow) => row.id;

const createBulkEditField = (columnKey: string | null = null): BulkEditFieldDraft => ({
	id: `bulk-field-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
	columnKey,
	value: "",
});

const getSelectedBulkEditColumnKeys = (fields: BulkEditFieldDraft[]) =>
	new Set(fields.map((field) => field.columnKey).filter((columnKey): columnKey is string => Boolean(columnKey)));


const isEmptyModalValue = (value: unknown) => {
	if (value === null || value === undefined) {
		return true;
	}

	if (typeof value === "string") {
		return value.trim() === "";
	}

	return false;
};

const isBlankRow = (row: EditableRow, columns: PdfColumn[]) => {
	return columns.every((column) => {
		const value = row[column.key];

		if (value === null || value === undefined) {
			return true;
		}

		return typeof value === "string" ? value.trim() === "" : value === "";
	});
};

const PdfDetailsPage = () => {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const searchParams = useSearchParams();
	const routeTableId = params?.id as string | undefined;
	const selectedTableId = searchParams.get("tableId") ?? routeTableId;

	const {
		data: table,
		isLoading: loading,
		error,
		refetch: refetchTable,
	} = useGetPdfByIdQuery(selectedTableId ?? "", {
		skip: !selectedTableId,
	});
	const {
		data: pdfTablesData,
		isLoading: tablesLoading,
		refetch: refetchTables,
	} = useGetPdfTablesQuery();
	const pdfTables = pdfTablesData ?? EMPTY_PDF_TABLES;
	const scopedTables = useMemo(() => {
		if (!selectedTableId) {
			return pdfTables;
		}

		return table && !table.isDeleted ? [table] : [];
	}, [pdfTables, selectedTableId, table]);
	const [createPdfTableRow, { isLoading: creatingRow }] = useCreatePdfTableRowMutation();
	const [updatePdfTableRow, { isLoading: savingExtractedRow }] = useUpdatePdfTableRowMutation();
	const [bulkUpdateRows, { isLoading: bulkUpdatingRows }] = useBulkUpdateRowsMutation();
	const [bulkDeleteRows, { isLoading: bulkDeletingRows }] = useBulkDeleteRowsMutation();
	const [deletePdfTableRow] = useDeletePdfTableRowMutation();
	const [clearPdfTableRows] = useClearPdfTableRowsMutation();
	const [deletePdfTable] = useDeletePdfTableMutation();
	const [messageApi, contextHolder] = message.useMessage();
	const [tableGroups, setTableGroups] = useState<EditableTableGroup[]>([]);
	const [editingRowKey, setEditingRowKey] = useState<string | null>(null);
	const [savingRowKey, setSavingRowKey] = useState<string | null>(null);
	const [deletingRowKey, setDeletingRowKey] = useState<string | null>(null);
	const [clearTableTargetId, setClearTableTargetId] = useState<string | null>(null);
	const [deleteTableTargetId, setDeleteTableTargetId] = useState<string | null>(null);
	const [deleteRowTarget, setDeleteRowTarget] = useState<{ tableId: string; rowId: string; rowKey: string } | null>(null);
	const [deleteSelectedRowsTarget, setDeleteSelectedRowsTarget] = useState<{ tableId: string; rowIds: string[] } | null>(null);
	const [deletingSelectedRows, setDeletingSelectedRows] = useState(false);
	const [bulkEditTableId, setBulkEditTableId] = useState<string | null>(null);
	const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
	const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false);
	const [bulkEditFields, setBulkEditFields] = useState<BulkEditFieldDraft[]>([]);
	const newRowIdRef = useRef(0);
	const isPageLoading = selectedTableId ? loading : tablesLoading;

	const refetchVisibleTables = async () => {
		if (selectedTableId) {
			await Promise.all([refetchTables(), refetchTable()]);
			return;
		}

		await refetchTables();
	};

	/* eslint-disable react-hooks/set-state-in-effect */
	useEffect(() => {
		if (error) {
			messageApi.error("Failed to fetch PDF");
		}
	}, [error, messageApi]);

	const tableGroupCount = tableGroups.length;
	const canEditTable = (tableId: string) => !selectedTableId || selectedTableId === tableId;

	useEffect(() => {
		setTableGroups(buildTableGroups(scopedTables));
		setEditingRowKey(null);
		setSavingRowKey(null);
		setDeletingRowKey(null);
		setSelectedRowKeys([]);
		setBulkEditTableId(null);
		setBulkEditModalOpen(false);
		setBulkEditFields([]);
	}, [scopedTables]);

	useEffect(() => {
		setSelectedRowKeys([]);
		setBulkEditTableId(null);
		setBulkEditModalOpen(false);
		setBulkEditFields([]);
	}, [selectedTableId]);
	/* eslint-enable react-hooks/set-state-in-effect */

	useEffect(() => {
		if (table?.isDeleted) {
			messageApi.info("This table has been deleted.");
			router.replace("/pdf/merged");
		}
	}, [messageApi, router, table]);

	useEffect(() => {
		if (!selectedTableId) {
			return;
		}

		const targetHeading = document.getElementById(`pdf-table-heading-${selectedTableId}`);
		if (!targetHeading) {
			return;
		}

		const headerOffset = 96;
		const targetTop = targetHeading.getBoundingClientRect().top + window.scrollY - headerOffset;

		window.scrollTo({ top: targetTop, behavior: "smooth" });
	}, [selectedTableId, tableGroups]);

	const handleSaveRow = async (tableKey: string, rowKey: string) => {
		const tableGroup = tableGroups.find((group) => group.key === tableKey);
		if (!tableGroup) return;
		if (!canEditTable(tableGroup.id)) return;

		const targetRow = tableGroup.rows.find((row) => getRowIdentity(row) === rowKey);
		if (!targetRow) return;

		for (const column of tableGroup.columns) {
			if (column.dataType === "number") {
				const rawValue = targetRow[column.key];
				if (rawValue !== "" && Number.isNaN(Number(rawValue))) {
					messageApi.error(`${column.title} must be a valid number.`);
					return;
				}
			}
		}

		if (targetRow.__isNew && isBlankRow(targetRow, tableGroup.columns)) {
			messageApi.error("Enter at least one value before creating a row.");
			return;
		}

		setSavingRowKey(rowKey);
		try {
			const payload = stripEditableRowKey(targetRow);
			if (targetRow.__isNew) {
				await createPdfTableRow({ tableId: tableKey, rowData: payload }).unwrap();
				messageApi.success("Row created successfully");
			} else {
				await updatePdfTableRow({ tableId: tableKey, rowId: targetRow.id, rowData: payload }).unwrap();
				messageApi.success("Row updated successfully");
			}
			await refetchVisibleTables();
			setEditingRowKey(null);
		} catch (mutationError: unknown) {
			messageApi.error(getErrorMessage(mutationError, "Failed to update row"));
		} finally {
			setSavingRowKey(null);
		}
	};

	const handleCancelEdit = () => {
		setTableGroups(buildTableGroups(scopedTables));
		setEditingRowKey(null);
	};

	const handleAddRow = (tableKey: string) => {
		if (!canEditTable(tableKey)) return;

		newRowIdRef.current += 1;
		const tempKey = `new-${newRowIdRef.current}`;

		setTableGroups((currentGroups) =>
			currentGroups.map((currentGroup) => {
				if (currentGroup.key !== tableKey) {
					return currentGroup;
				}

				const blankRow: EditableRow = {
					id: tempKey,
					__rowKey: tempKey,
					__isNew: true,
					rowIndex: 0,
				};

				currentGroup.columns.forEach((column) => {
					blankRow[column.key] = column.dataType === "number" ? "" : "";
				});

				return {
					...currentGroup,
					rows: [blankRow, ...currentGroup.rows.map((row, index) => ({ ...row, rowIndex: index + 1 }))],
				};
			}),
		);
		setEditingRowKey(tempKey);
	};

	const handleBulkSelectionChange = (tableId: string, nextSelectedRowKeys: React.Key[]) => {
		const nextKeys = nextSelectedRowKeys.map((key) => String(key));
		const hasSelection = nextKeys.length > 0;
		const tableChanged = bulkEditTableId !== null && bulkEditTableId !== tableId;

		setSelectedRowKeys(nextKeys);
		setBulkEditTableId(hasSelection ? tableId : null);

		if (!hasSelection || tableChanged) {
			setBulkEditModalOpen(false);
			setBulkEditFields([]);
		}
	};

	const handleOpenBulkEdit = (tableId: string) => {
		const tableGroup = tableGroups.find((group) => group.id === tableId);
		if (!tableGroup) {
			return;
		}

		setBulkEditTableId(tableId);
		setBulkEditFields([createBulkEditField()]);
		setBulkEditModalOpen(true);
	};

	const handleOpenDeleteSelectedRows = (tableId: string) => {
		if (selectedRowKeys.length === 0) {
			return;
		}

		const tableGroup = tableGroups.find((group) => group.id === tableId);
		const validRowIds = (tableGroup?.rows ?? [])
			.map((row) => row.id)
			.filter((rowId) => selectedRowKeys.includes(rowId));

		if (validRowIds.length === 0) {
			messageApi.error("Select valid rows before deleting them.");
			return;
		}

		setDeleteSelectedRowsTarget({ tableId, rowIds: validRowIds });
	};

	const handleCloseBulkEdit = () => {
		setBulkEditModalOpen(false);
		setBulkEditFields([]);
	};

	const handleAddBulkEditField = () => {
		if (!activeBulkTableGroup || bulkEditFields.length >= activeBulkTableGroup.columns.length) {
			return;
		}

		setBulkEditFields((currentFields) => [...currentFields, createBulkEditField()]);
	};

	const handleUpdateBulkEditField = (
		fieldId: string,
		changes: Partial<Pick<BulkEditFieldDraft, "columnKey" | "value">>,
	) => {
		setBulkEditFields((currentFields) =>
			currentFields.map((field) =>
				field.id === fieldId
					? {
						...field,
						...changes,
					}
					: field,
			),
		);
	};

	const handleDeleteBulkEditField = (fieldId: string) => {
		setBulkEditFields((currentFields) => {
			const nextFields = currentFields.filter((field) => field.id !== fieldId);
			return nextFields.length > 0 ? nextFields : [createBulkEditField()];
		});
	};

	const handleSubmitBulkEdit = async () => {
		if (!bulkEditTableId || selectedRowKeys.length === 0) {
			return;
		}

		const tableGroup = tableGroups.find((group) => group.id === bulkEditTableId);
		if (!tableGroup) {
			return;
		}

		const selectedFields = bulkEditFields
			.map((field) => {
				if (!field.columnKey) {
					return null;
				}

				const column = tableGroup.columns.find((candidate) => candidate.key === field.columnKey);
				return column ? { ...field, column } : null;
			})
			.filter((field): field is BulkEditFieldDraft & { column: PdfColumn } => Boolean(field));

		if (selectedFields.length === 0) {
			messageApi.error("Select at least one column to update.");
			return;
		}

		const uniqueSelectedRowIds = [...new Set(selectedRowKeys)].filter(
			(rowId): rowId is string => typeof rowId === 'string' && rowId.trim().length > 0,
		);

		const dataToApply: Record<string, unknown> = {};
		for (const field of selectedFields) {
			const { column, value } = field;

			if (isEmptyModalValue(value)) {
				continue;
			}

			if (column.dataType === 'number') {
				const nextNumber = Number(value);
				if (Number.isNaN(nextNumber)) {
					messageApi.error(`${column.title} must be a valid number.`);
					return;
				}

				dataToApply[column.key] = nextNumber;
				continue;
			}

			dataToApply[column.key] = value;
		}

		if (Object.keys(dataToApply).length === 0) {
			messageApi.error('Enter at least one value before bulk updating rows.');
			return;
		}

		try {
			await bulkUpdateRows({ tableId: tableGroup.id, rowIds: uniqueSelectedRowIds, data: dataToApply }).unwrap();

			setTableGroups((currentGroups) =>
				currentGroups.map((currentGroup) =>
					currentGroup.id !== tableGroup.id
						? currentGroup
						: {
							...currentGroup,
							rows: currentGroup.rows.map((row) => (uniqueSelectedRowIds.includes(row.id) ? { ...row, ...dataToApply } : row)),
						},
				),
			);

			messageApi.success('Rows updated successfully');
			handleCloseBulkEdit();
			setSelectedRowKeys([]);
			setBulkEditTableId(null);
			await refetchVisibleTables();
		} catch (mutationError: unknown) {
			messageApi.error(getErrorMessage(mutationError, 'Failed to bulk update rows'));
		}
	};

	const handleRowFieldChange = (
		tableKey: string,
		rowKey: string,
		column: PdfColumn,
		rawValue: string,
	) => {
		const nextValue =
			column.dataType === "number" ? (rawValue === "" ? "" : Number(rawValue)) : rawValue;

		setTableGroups((currentGroups) =>
			currentGroups.map((currentGroup) => {
				if (currentGroup.key !== tableKey) {
					return currentGroup;
				}

				return {
					...currentGroup,
					rows: currentGroup.rows.map((currentRow) =>
						getRowIdentity(currentRow) === rowKey
							? { ...currentRow, [column.key]: nextValue }
							: currentRow,
					),
				};
			}),
		);
	};

	const renderRowEditPanel = (group: EditableTableGroup, record: EditableRow) => (
		<div className="pdf-row-edit-panel">
			<div className="pdf-row-edit-grid">
				{group.columns.map((column, columnIndex) => (
					<div key={column.key} className="pdf-row-edit-field">
						<label htmlFor={`${record.id}-${column.key}`}>{column.title}</label>
						<Input
							id={`${record.id}-${column.key}`}
							type={column.dataType === "number" ? "number" : "text"}
							size="middle"
							value={record[column.key] ?? ""}
							autoFocus={columnIndex === 0}
							onChange={(event) =>
								handleRowFieldChange(group.key, record.id, column, event.target.value)
							}
						/>
					</div>
				))}
			</div>
			<div className="pdf-row-edit-actions">
				<Button
					variant="primary"
					icon={<SaveOutlined />}
					loading={savingRowKey === record.id || creatingRow || savingExtractedRow}
					onClick={() => void handleSaveRow(group.key, record.id)}
				>
					{record.__isNew ? 'Create row' : 'Save changes'}
				</Button>
				<Button variant="secondary" icon={<CloseOutlined />} onClick={handleCancelEdit}>
					Cancel
				</Button>
			</div>
		</div>
	);

	const handleDeleteRow = async (tableKey: string, rowKey: string) => {
		const tableGroup = tableGroups.find((group) => group.key === tableKey);
		if (!tableGroup) return;
		if (!canEditTable(tableGroup.id)) return;

		const targetRow = tableGroup.rows.find((row) => getRowIdentity(row) === rowKey);
		if (!targetRow) return;

		if (targetRow.__isNew) {
			setTableGroups((currentGroups) =>
				currentGroups.map((currentGroup) =>
					currentGroup.key !== tableKey
						? currentGroup
						: {
							...currentGroup,
							rows: currentGroup.rows.filter((row) => getRowIdentity(row) !== rowKey),
						},
				),
			);
			setEditingRowKey(null);
			return;
		}

		setDeleteRowTarget({ tableId: tableKey, rowId: targetRow.id, rowKey });
	};

	const handleClearTable = (tableId: string) => {
		if (!canEditTable(tableId)) return;
		setClearTableTargetId(tableId);
	};

	const handleDeleteTable = (tableId: string) => {
		if (!canEditTable(tableId)) return;
		setDeleteTableTargetId(tableId);
	};

	const handleDeleteSelectedRows = async () => {
		if (!deleteSelectedRowsTarget) {
			return;
		}

		setDeletingSelectedRows(true);
		try {
			await bulkDeleteRows({
				tableId: deleteSelectedRowsTarget.tableId,
				rowIds: deleteSelectedRowsTarget.rowIds,
			}).unwrap();

			await refetchVisibleTables();
			messageApi.success(
				`Selected row${deleteSelectedRowsTarget.rowIds.length === 1 ? "" : "s"} deleted successfully`,
			);
			setSelectedRowKeys([]);
			setBulkEditTableId(null);
			setBulkEditModalOpen(false);
			setBulkEditFields([]);
			if (editingRowKey && deleteSelectedRowsTarget.rowIds.includes(editingRowKey)) {
				setEditingRowKey(null);
			}
			setDeleteSelectedRowsTarget(null);
		} catch (mutationError: unknown) {
			messageApi.error(getErrorMessage(mutationError, "Failed to delete selected rows"));
		} finally {
			setDeletingSelectedRows(false);
		}
	};

	const handleSelectTable = (tableId: string, rowKey?: string) => {
		router.push(`/pdf/${tableId}?tableId=${tableId}`, { scroll: false });
		setEditingRowKey(rowKey ?? null);
	};

	const activeBulkTableGroup = bulkEditTableId
		? tableGroups.find((group) => group.id === bulkEditTableId) ?? null
		: null;
	const canAddBulkEditField = Boolean(
		activeBulkTableGroup && bulkEditFields.length < activeBulkTableGroup.columns.length,
	);

	const hasStructuredData = tableGroups.length > 0;
	const pageDisplayTitle = getDisplayTableTitle(
		table?.title,
		table?.sourceFileName,
		"Loading table...",
	);
	const selectedRowsMenuItems: MenuProps['items'] = [
		{
			key: "edit-selected-rows",
			label: "Edit selected rows",
			onClick: () => {
				if (bulkEditTableId) {
					handleOpenBulkEdit(bulkEditTableId);
				}
			},
		},
		{
			key: "delete-selected-rows",
			label: "Delete selected rows",
			danger: true,
			onClick: () => {
				if (bulkEditTableId) {
					handleOpenDeleteSelectedRows(bulkEditTableId);
				}
			},
		},
	];

	return (
		<StyledPdfDetailsPage className="mx-auto max-w-7xl px-6 py-6">
			{contextHolder}
			<div className="pdf-detail-layout">
				<div className="pdf-detail-topbar">
					<div>
						<p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Table Extraction</p>
						<h1 className="mt-2 text-3xl font-semibold text-slate-900">{pageDisplayTitle}</h1>
					</div>
					<div className="pdf-detail-actions">
						<Button variant="secondary" icon={<ArrowLeftOutlined />} href="/pdf/merged">
							Back to list
						</Button>
					</div>
				</div>

				<div className="pdf-detail-card">
					<div className="pdf-detail-header">
						<div className="flex items-center gap-3">
							<div className="pdf-detail-badge">
								<FilePdfOutlined className="text-xl text-rose-300" />
							</div>
							<div>
								<p className="pdf-detail-subtitle">Structured PDF data</p>
								<h2 className="pdf-detail-title">
									{tableGroupCount > 1 ? `${tableGroupCount} tables detected` : "Edit rows directly in the table"}
								</h2>
							</div>
						</div>

						<div className="pdf-detail-actions" />
					</div>

					<Modal
						open={Boolean(deleteSelectedRowsTarget)}
						title={
							deleteSelectedRowsTarget
								? `Delete ${deleteSelectedRowsTarget.rowIds.length} selected row${deleteSelectedRowsTarget.rowIds.length === 1 ? "" : "s"}`
								: "Delete selected rows"
						}
						okText="Delete"
						cancelText="Cancel"
						okButtonProps={{ danger: true, loading: deletingSelectedRows || bulkDeletingRows }}
						onOk={() => void handleDeleteSelectedRows()}
						onCancel={() => setDeleteSelectedRowsTarget(null)}
					>
						<p className="text-sm leading-6 text-slate-600">
							This will permanently remove the selected row{deleteSelectedRowsTarget && deleteSelectedRowsTarget.rowIds.length === 1 ? "" : "s"} from the table.
						</p>
					</Modal>

					<Modal
						open={Boolean(deleteRowTarget)}
						title="Delete row"
						okText="Delete"
						cancelText="Cancel"
						okButtonProps={{ danger: true, loading: deletingRowKey === deleteRowTarget?.rowKey }}
						onOk={async () => {
							if (!deleteRowTarget) return;
							setDeletingRowKey(deleteRowTarget.rowKey);
							try {
								await deletePdfTableRow({
									tableId: deleteRowTarget.tableId,
									rowId: deleteRowTarget.rowId,
								}).unwrap();
								await refetchVisibleTables();
								messageApi.success("Row deleted successfully");
								if (editingRowKey === deleteRowTarget.rowKey) {
									setEditingRowKey(null);
								}
								setDeleteRowTarget(null);
							} catch (mutationError: unknown) {
								messageApi.error(getErrorMessage(mutationError, "Failed to delete row"));
							} finally {
								setDeletingRowKey(null);
							}
						}}
						onCancel={() => setDeleteRowTarget(null)}
					/>

					<Modal
						open={Boolean(clearTableTargetId)}
						title="Clear extracted data"
						okText="Clear data"
						cancelText="Cancel"
						okButtonProps={{ danger: true }}
						onOk={async () => {
							if (!clearTableTargetId) return;
							try {
								await clearPdfTableRows(clearTableTargetId).unwrap();
								await refetchVisibleTables();
								messageApi.success("Table rows cleared successfully");
								setClearTableTargetId(null);
							} catch (mutationError: unknown) {
								messageApi.error(getErrorMessage(mutationError, "Failed to clear extracted data"));
							}
						}}
						onCancel={() => setClearTableTargetId(null)}
					/>

					<Modal
						open={Boolean(deleteTableTargetId)}
						title="Delete table"
						okText="Delete table"
						cancelText="Cancel"
						okButtonProps={{ danger: true }}
						onOk={async () => {
							if (!deleteTableTargetId) return;
							try {
								const targetTableId = deleteTableTargetId;
								await deletePdfTable(targetTableId).unwrap();
								await refetchVisibleTables();
								messageApi.success("Table deleted successfully");
								setDeleteTableTargetId(null);
								if (selectedTableId && selectedTableId === targetTableId) {
									router.push("/pdf/merged");
								}
							} catch (mutationError: unknown) {
								messageApi.error(getErrorMessage(mutationError, "Failed to delete table"));
							}
						}}
						onCancel={() => setDeleteTableTargetId(null)}
					/>

					<Modal
						open={bulkEditModalOpen}
						title={
							activeBulkTableGroup
								? `Bulk Edit ${selectedRowKeys.length} row${selectedRowKeys.length === 1 ? "" : "s"}`
								: "Bulk Edit"
						}
						okText="Apply changes"
						cancelText="Cancel"
						confirmLoading={bulkUpdatingRows}
						onOk={() => void handleSubmitBulkEdit()}
						onCancel={handleCloseBulkEdit}
						width="46vw"
						styles={{ body: { padding: 20 } }}
						destroyOnHidden
					>
						{activeBulkTableGroup ? (
							<div className="pdf-bulk-edit-form">
								<div className="pdf-bulk-edit-toolbar">
									<p className="pdf-bulk-edit-hint">
										Pick columns, enter a shared value, and apply it to all selected rows.
									</p>
									<Button
										className="pdf-bulk-edit-add-btn"
										variant="icon-button-1"
										onClick={handleAddBulkEditField}
										disabled={!canAddBulkEditField}
										icon={<PlusOutlined />}
									/>
								</div>

								{bulkEditFields.length > 0 ? (
									<div className="space-y-3">
										{(() => {
											const selectedColumnKeys = getSelectedBulkEditColumnKeys(bulkEditFields);
											return bulkEditFields.map((field) => {
											const selectedColumn = activeBulkTableGroup.columns.find((column) => column.key === field.columnKey) ?? null;
											const availableColumns = activeBulkTableGroup.columns.filter(
												(column) => column.key === field.columnKey || !selectedColumnKeys.has(column.key),
											);

											return (
												<div key={field.id} className="pdf-bulk-edit-row">
													<div
														className="pdf-bulk-edit-row-main"
														style={{ gridTemplateColumns: "220px 240px auto", display: "grid", alignItems: "end", gap: "10px" }}
													>
														<div className="pdf-bulk-edit-field">
															<label htmlFor={`bulk-field-column-${field.id}`}>Field</label>
															<Select
																id={`bulk-field-column-${field.id}`}
																variant="soft"
																size="large"
																value={field.columnKey ?? undefined}
																placeholder="Select field"
																options={availableColumns.map((column) => ({
																	label: column.title,
																	value: column.key,
																}))}
																onChange={(nextValue) =>
																	handleUpdateBulkEditField(field.id, {
																		columnKey: String(nextValue),
																		value: "",
																	})
																}
															/>
														</div>

														<div className="pdf-bulk-edit-field">
															<label htmlFor={`bulk-field-value-${field.id}`}>Value</label>
															<Input
																id={`bulk-field-value-${field.id}`}
																size="large"
																type={selectedColumn?.dataType === "number" ? "number" : "text"}
																value={field.value}
																disabled={!field.columnKey}
																placeholder={field.columnKey ? `Enter ${selectedColumn?.title ?? "value"}` : "Select a field first"}
																onChange={(event) =>
																	handleUpdateBulkEditField(field.id, { value: event.target.value })
																}
															/>
														</div>
														<Button
															variant="icon-button-2"
															className="pdf-bulk-edit-delete-btn"
															icon={<DeleteOutlined />}
															onClick={() => handleDeleteBulkEditField(field.id)}
														/>
													</div>
												</div>
											);
											});
										})()}
									</div>
								) : (
									<div className="pdf-bulk-edit-empty">Add a column to start bulk editing.</div>
								)}
							</div>
						) : (
							<p className="text-sm text-slate-500">Select rows from a table before opening bulk edit.</p>
						)}
					</Modal>

					<div className="p-6">
						{isPageLoading ? (
							<div className="pdf-empty-state text-slate-500">
								Loading structured data...
							</div>
						) : hasStructuredData ? (
							<div className="pdf-multi-table-list">
								{tableGroups.map((group) => {
									const isSelectedTable = !selectedTableId || selectedTableId === group.id;
									const isBulkActiveTable = bulkEditTableId === group.id;
									const columns: ColumnsType<EditableRow> = [
										{
											title: "S.No",
											key: "serialNo",
											width: 90,
											align: "center",
											onHeaderCell: () => ({
												className: "whitespace-nowrap bg-slate-50 text-slate-700",
											}),
											render: (_value: unknown, _record: EditableRow, index: number) => index + 1,
										},
										...group.columns.map((column) => {
											return {
												title: column.title,
												dataIndex: column.key,
												key: column.key,
												ellipsis: true,
													align: column.dataType === "number" ? ("right" as const) : undefined,
												onHeaderCell: () => ({
													className: "whitespace-nowrap bg-slate-50 text-slate-700",
												}),
												render: (_value: unknown, record: EditableRow) => renderCell(record[column.key]),
											};
										}),
									];

									columns.push({
										title: "Actions",
										key: "actions",
										width: 180,
										onCell: () => ({
											className: "pdf-actions-cell",
										}),
										render: (_: unknown, record: EditableRow) => {
											const isEditing = editingRowKey === record.id;

											if (!isSelectedTable) {
												return (
													<Button
														variant="secondary"
														size="small"
														icon={<EditOutlined />}
														onClick={() => handleSelectTable(group.id, record.id)}
													/>
												);
											}

											return (
												<div className="pdf-row-actions">
													{isEditing ? (
														<span className="pdf-editing-badge">Editing</span>
													) : (
														<Button
															variant="secondary"
															size="small"
															icon={<EditOutlined />}
															onClick={() => setEditingRowKey(record.id)}
														/>
													)}

													<Button
														variant="danger"
														size="small"
														icon={<DeleteOutlined />}
														loading={deletingRowKey === record.id}
																onClick={() => void handleDeleteRow(group.key, record.id)}
													/>
												</div>
											);
										},
									});

									return (
										<section id={`pdf-table-${group.id}`} key={group.key} className="pdf-section-card pdf-table-group">
											<div className="pdf-section-header">
												<div>
													<h3 id={`pdf-table-heading-${group.id}`} className="pdf-section-title scroll-mt-24">
														{group.title}
													</h3>
													<p className="pdf-section-copy">
														{group.rows.length} rows • {group.columns.length} columns
													</p>
												</div>
												{isSelectedTable ? (
													<div className="pdf-detail-actions">
														<Button variant="secondary" size="small" onClick={() => handleAddRow(group.key)}>
															Add row
														</Button>
														<Button variant="secondary" size="small" onClick={() => handleClearTable(group.id)}>
															Clear rows
														</Button>
														<Button
															variant="danger"
															size="small"
															icon={<DeleteOutlined />}
															onClick={() => handleDeleteTable(group.id)}
															title="Delete table"
															aria-label="Delete table"
														/>
														<div
															className={
																isBulkActiveTable && selectedRowKeys.length > 0
																	? "pdf-detail-actions__menu-slot"
																	: "pdf-detail-actions__menu-slot pdf-detail-actions__menu-slot--hidden"
															}
														>
															<Dropdown menuItems={selectedRowsMenuItems} trigger={["click"]} placement="bottomRight">
																<Button variant="secondary" size="small" icon={<MoreOutlined />} aria-label="Selected row actions" />
															</Dropdown>
														</div>
													</div>
												) : (
													<Button
														variant="secondary"
														size="small"
														icon={<EditOutlined />}
														onClick={() => handleSelectTable(group.id)}
													>
														Edit table
													</Button>
												)}
											</div>
											<div className="p-6">
												<div className="pdf-table-shell">
													<Table<EditableRow>
														columns={columns}
														dataSource={group.rows}
														rowKey={(row: EditableRow) => row.id}
														pagination={false}
														className="pdf-structured-table"
														rowClassName={(row: EditableRow) =>
															editingRowKey === row.id ? "pdf-editing-row" : ""
														}
														rowSelection={
															isSelectedTable
																? {
																	columnWidth: 56,
																	selectedRowKeys: isBulkActiveTable ? selectedRowKeys : [],
																	onChange: (nextSelectedRowKeys) =>
																		handleBulkSelectionChange(group.id, nextSelectedRowKeys),
																	getCheckboxProps: (record: EditableRow) => ({
																		disabled: Boolean(record.__isNew),
																	}),
																}
																: undefined
														}
														expandable={{
															showExpandColumn: false,
															expandedRowKeys: editingRowKey
															? group.rows.some((row) => row.id === editingRowKey)
																	? [editingRowKey]
																	: []
																: [],
															expandedRowRender: (record: EditableRow) =>
															editingRowKey === record.id
																	? renderRowEditPanel(group, record)
																	: null,
															rowExpandable: (record: EditableRow) => editingRowKey === record.id,
														}}
													/>
												</div>
											</div>
										</section>
									);
								})}
							</div>
						) : (
							<div className="pdf-empty-state">
								<div className="pdf-empty-state__icon">
									<FilePdfOutlined className="text-3xl text-slate-400" />
								</div>
								<h3 className="text-lg font-semibold text-slate-900">No structured data found</h3>
								<p className="mt-2 max-w-lg text-sm leading-6 text-slate-600">
									This PDF was extracted, but the backend did not return any structured rows or columns for display.
								</p>
							</div>
						)}
					</div>
				</div>

				
			</div>
		</StyledPdfDetailsPage>
	);
};

export default PdfDetailsPage;
