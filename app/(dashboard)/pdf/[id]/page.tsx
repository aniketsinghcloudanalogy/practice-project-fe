"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftOutlined, CloseOutlined, DeleteOutlined, EditOutlined, FilePdfOutlined, PlusOutlined, SaveOutlined } from "@/components/common/antd/icons";
import Button from "@/components/common/Button";
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
	useDeletePdfTableMutation,
	useDeletePdfTableRowMutation,
	useDeletePdfMutation,
	useGetPdfTablesQuery,
	useGetPdfByIdQuery,
	useUpdatePdfTableRowMutation,
} from "@/store/services/pdf/apiSlice";
import type { PdfColumn, PdfTable, PdfTableRow } from "@/store/services/types";

type EditableRow = PdfTableRow & { __rowKey: string; __isNew?: boolean };

type EditableTableGroup = {
	id: string;
	key: string;
	title: string;
	columns: PdfColumn[];
	rows: EditableRow[];
	index: number;
	pdfDocumentId: string;
	schemaHash: string;
	tableHash: string;
};

type BulkEditDrafts = Record<
  string,
  Record<string, string>
>;


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
	const { __rowKey, __isNew, id, rowIndex, rowHash, ...rest } = row;
	return rest;
};

const getTableTitle = (table: PdfTable, index: number) => {
	return table.title?.trim() || `Table ${index + 1}`;
};

const buildTableGroups = (tables: PdfTable[] | undefined): EditableTableGroup[] => {
	return (tables ?? [])
		.filter((table) => !table.isDeleted)
		.map((table, tableIndex) => {
		const rows = buildEditableRows(table.rows).map((row, rowIndex) => ({
			...row,
			__rowKey: `table-${tableIndex + 1}:${row.__rowKey || rowIndex}`,
		}));

		return {
			id: table.id,
			key: table.id,
			title: getTableTitle(table as unknown as PdfTable, tableIndex),
			columns: table.columns.length > 0 ? table.columns : inferColumnsFromRows(rows),
			rows,
			index: tableIndex,
			pdfDocumentId: table.pdfDocumentId,
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

const getColumnFieldName = (column: PdfColumn) => column.key?.trim() || column.title.trim();

const createBulkEditField = (columnKey: string | null = null): BulkEditFieldDraft => ({
	id: `bulk-field-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
	columnKey,
	value: "",
});

const getRowLabel = (row: EditableRow, index: number) => (row.rowIndex != null ? `Row ${row.rowIndex}` : `Row ${index + 1}`);

const buildBulkEditDrafts = (tableGroup: EditableTableGroup, rowIds: string[]): BulkEditDrafts => {
	return rowIds.reduce<BulkEditDrafts>((drafts, rowId) => {
		const row = tableGroup.rows.find((candidate) => candidate.id === rowId);
		if (!row) {
			return drafts;
		}

		drafts[rowId] = tableGroup.columns.reduce<Record<string, string>>((rowDraft, column) => {
			const fieldName = getColumnFieldName(column);
			const value = row[column.key];
			rowDraft[fieldName] = value === null || value === undefined ? "" : String(value);
			return rowDraft;
		}, {});

		return drafts;
	}, {});
};

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
	const pdfId = params?.id as string | undefined;
	const selectedTableId = searchParams.get("tableId");

	const { data: pdf, isLoading: loading, error } = useGetPdfByIdQuery(pdfId ?? "", {
		skip: !pdfId,
	});
	const {
		data: pdfTablesData,
		isLoading: tablesLoading,
		refetch: refetchTables,
	} = useGetPdfTablesQuery(pdfId ?? "", {
		skip: !pdfId,
	});
	const pdfTables = pdfTablesData ?? EMPTY_PDF_TABLES;
	const [createPdfTableRow, { isLoading: creatingRow }] = useCreatePdfTableRowMutation();
	const [updatePdfTableRow, { isLoading: savingExtractedRow }] = useUpdatePdfTableRowMutation();
	const [bulkUpdateRows, { isLoading: bulkUpdatingRows }] = useBulkUpdateRowsMutation();
	const [deletePdfTableRow] = useDeletePdfTableRowMutation();
	const [clearPdfTableRows] = useClearPdfTableRowsMutation();
	const [deletePdfTable] = useDeletePdfTableMutation();
	const [deletePdf] = useDeletePdfMutation();
	const [messageApi, contextHolder] = message.useMessage();
	const [tableGroups, setTableGroups] = useState<EditableTableGroup[]>([]);
	const [editingRowKey, setEditingRowKey] = useState<string | null>(null);
	const [savingRowKey, setSavingRowKey] = useState<string | null>(null);
	const [deletingRowKey, setDeletingRowKey] = useState<string | null>(null);
	const [clearTableTargetId, setClearTableTargetId] = useState<string | null>(null);
	const [deleteTableTargetId, setDeleteTableTargetId] = useState<string | null>(null);
	const [deleteRowTarget, setDeleteRowTarget] = useState<{ tableId: string; rowId: string; rowKey: string } | null>(null);
	const [deletePdfOpen, setDeletePdfOpen] = useState(false);
	const [bulkEditTableId, setBulkEditTableId] = useState<string | null>(null);
	const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
	const [rowSelectionMode, setRowSelectionMode] = useState(false);
	const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false);
	const [bulkEditDrafts, setBulkEditDrafts] = useState<BulkEditDrafts>({});
	const [bulkEditFields, setBulkEditFields] = useState<BulkEditFieldDraft[]>([]);
	const newRowIdRef = useRef(0);
	const isPageLoading = loading || tablesLoading;

	/* eslint-disable react-hooks/set-state-in-effect */
	useEffect(() => {
		if (error) {
			messageApi.error("Failed to fetch PDF");
		}
	}, [error, messageApi]);

	const tableGroupCount = tableGroups.length;
	const canEditTable = (tableId: string) => !selectedTableId || selectedTableId === tableId;

	useEffect(() => {
		setTableGroups(buildTableGroups(pdfTables));
		setEditingRowKey(null);
		setSavingRowKey(null);
		setDeletingRowKey(null);
		setSelectedRowKeys([]);
		setBulkEditTableId(null);
		setRowSelectionMode(false);
		setBulkEditModalOpen(false);
		setBulkEditFields([]);
	}, [pdfTables]);

	useEffect(() => {
		setSelectedRowKeys([]);
		setBulkEditTableId(null);
		setRowSelectionMode(false);
		setBulkEditModalOpen(false);
		setBulkEditFields([]);
	}, [selectedTableId]);
	/* eslint-enable react-hooks/set-state-in-effect */

	useEffect(() => {
		if (pdf?.isDeleted) {
			messageApi.info("This PDF has been deleted.");
			router.replace("/pdf");
		}
	}, [messageApi, pdf, router]);

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
		if (!pdf) return;

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
			await refetchTables();
			setEditingRowKey(null);
		} catch (mutationError: unknown) {
			messageApi.error(getErrorMessage(mutationError, "Failed to update row"));
		} finally {
			setSavingRowKey(null);
		}
	};

	const handleCancelEdit = () => {
		setTableGroups(buildTableGroups(pdfTables));
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
			setBulkEditDrafts({});
		}
	};

	const handleStartRowSelection = (tableId: string) => {
		setBulkEditTableId(tableId);
		setSelectedRowKeys([]);
		setRowSelectionMode(true);
		setBulkEditModalOpen(false);
		setBulkEditDrafts({});
	};

	const handleStopRowSelection = () => {
		setRowSelectionMode(false);
		setSelectedRowKeys([]);
		setBulkEditTableId(null);
		setBulkEditModalOpen(false);
		setBulkEditDrafts({});
	};

	const handleOpenBulkEdit = (tableId: string) => {
		const tableGroup = tableGroups.find((group) => group.id === tableId);
		if (!tableGroup) {
			return;
		}

		setBulkEditTableId(tableId);
		setBulkEditDrafts(buildBulkEditDrafts(tableGroup, selectedRowKeys));
		setBulkEditModalOpen(true);
	};

	const handleCloseBulkEdit = () => {
		setBulkEditModalOpen(false);
		setBulkEditDrafts({});
	};

	const handleSubmitBulkEdit = async () => {
		if (!bulkEditTableId || selectedRowKeys.length === 0) {
			return;
		}

		const tableGroup = tableGroups.find((group) => group.id === bulkEditTableId);
		if (!tableGroup) {
			return;
		}

		const updates: { rowId: string; rowData: Record<string, unknown> }[] = [];

		for (const row of tableGroup.rows) {
			if (!selectedRowKeys.includes(row.id)) {
				continue;
			}

			const draft = bulkEditDrafts[row.id] ?? {};
			const rowData: Record<string, unknown> = {};

			for (const column of tableGroup.columns) {
				const fieldName = getColumnFieldName(column);
				const value = draft[fieldName];

				if (isEmptyModalValue(value)) {
					continue;
				}

				if (column.dataType === "number") {
					const nextNumber = Number(value);
					if (Number.isNaN(nextNumber)) {
						messageApi.error(`${column.title} must be a valid number.`);
						return;
					}

					if (Number(row[column.key]) !== nextNumber) {
						rowData[fieldName] = nextNumber;
					}

					continue;
				}

				if (String(row[column.key] ?? "") !== value) {
					rowData[fieldName] = value;
				}
			}

			if (Object.keys(rowData).length > 0) {
				updates.push({ rowId: row.id, rowData });
			}
		}

		if (updates.length === 0) {
			messageApi.error("Enter at least one value before bulk updating rows.");
			return;
		}

		try {
			await bulkUpdateRows({
				tableId: tableGroup.id,
				updates,
			}).unwrap();
			messageApi.success("Rows updated successfully");
			handleCloseBulkEdit();
			setSelectedRowKeys([]);
			setBulkEditTableId(null);
			setRowSelectionMode(false);
			await refetchTables();
		} catch (mutationError: unknown) {
			messageApi.error(getErrorMessage(mutationError, "Failed to bulk update rows"));
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
		if (!pdf) return;

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

	const handleSelectTable = (tableId: string, rowKey?: string) => {
		if (!pdfId) return;

		router.push(`/pdf/${pdfId}?tableId=${tableId}`, { scroll: false });
		setEditingRowKey(rowKey ?? null);
	};

	const handleDeletePdf = () => {
		if (!pdf) return;
		setDeletePdfOpen(true);
	};

	const activeBulkTableGroup = bulkEditTableId
		? tableGroups.find((group) => group.id === bulkEditTableId) ?? null
		: null;
	const activeBulkRows = activeBulkTableGroup
		? selectedRowKeys
				.map((rowId) => activeBulkTableGroup.rows.find((row) => row.id === rowId))
				.filter((row): row is EditableRow => Boolean(row))
		: [];

	const hasStructuredData = tableGroups.length > 0;

	return (
		<StyledPdfDetailsPage className="mx-auto max-w-7xl px-6 py-6">
			{contextHolder}
			<div className="pdf-detail-layout">
				<div className="pdf-detail-topbar">
					<div>
						<p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">PDF Extraction</p>
						<h1 className="mt-2 text-3xl font-semibold text-slate-900">{pdf?.fileName ?? "Loading PDF..."}</h1>
					</div>
					<div className="pdf-detail-actions">
						<Button variant="secondary" icon={<ArrowLeftOutlined />} href="/pdf">
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

						<div className="pdf-detail-actions">
							<Button variant="danger-light" icon={<DeleteOutlined />} onClick={handleDeletePdf} disabled={!pdf} />
						</div>
					</div>

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
								await refetchTables();
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
								await refetchTables();
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
								await deletePdfTable(deleteTableTargetId).unwrap();
								await refetchTables();
								messageApi.success("Table deleted successfully");
								setDeleteTableTargetId(null);
							} catch (mutationError: unknown) {
								messageApi.error(getErrorMessage(mutationError, "Failed to delete table"));
							}
						}}
						onCancel={() => setDeleteTableTargetId(null)}
					/>

					<Modal
						open={deletePdfOpen}
						title="Delete PDF"
						okText="Delete"
						cancelText="Cancel"
						okButtonProps={{ danger: true }}
						onOk={async () => {
							if (!pdf) return;
							try {
								const response = await deletePdf(pdf.id).unwrap();
								messageApi.success(response.message || "PDF deleted successfully");
								router.push("/pdf");
								setDeletePdfOpen(false);
							} catch (mutationError: unknown) {
								messageApi.error(getErrorMessage(mutationError, "Failed to delete PDF"));
							}
						}}
						onCancel={() => setDeletePdfOpen(false)}
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
						width="92vw"
						styles={{ body: { padding: 20 } }}
						destroyOnHidden
					>
						{activeBulkTableGroup ? (
							<div className="max-h-[72vh] overflow-auto rounded-2xl border border-slate-200 bg-slate-50">
								<div
									className="min-w-max"
									style={{ gridTemplateColumns: `260px repeat(${activeBulkRows.length}, minmax(280px, 1fr))` }}
								>
									<div className="grid sticky top-0 z-30 border-b border-slate-200 bg-slate-100" style={{ gridTemplateColumns: `260px repeat(${activeBulkRows.length}, minmax(280px, 1fr))` }}>
										<div className="sticky left-0 z-40 border-r border-slate-200 bg-slate-100 px-5 py-4 text-sm font-semibold text-slate-700">
											Field
										</div>
										{activeBulkRows.map((row, index) => (
											<div key={row.id} className="border-r border-slate-200 bg-slate-100 px-5 py-4">
												<p className="text-sm font-semibold text-slate-900">{getRowLabel(row, index)}</p>
											</div>
										))}
									</div>

									{activeBulkTableGroup.columns.map((column) => {
										const fieldName = getColumnFieldName(column);

										return (
											<Fragment key={column.key}>
												<div className="grid border-b border-slate-200" style={{ gridTemplateColumns: `260px repeat(${activeBulkRows.length}, minmax(280px, 1fr))` }}>
													<div className="sticky left-0 z-20 border-r border-slate-200 bg-white px-5 py-5 text-sm font-medium text-slate-700">
														{column.title}
													</div>
													{activeBulkRows.map((row) => {
														const currentValue = bulkEditDrafts[row.id]?.[fieldName] ?? "";

														return (
															<div key={`${row.id}-${fieldName}`} className="border-r border-slate-200 bg-white p-4">
																<Input
																	size="large"
																	type={column.dataType === "number" ? "number" : "text"}
																	value={currentValue}
																	placeholder={`Edit ${column.title}`}
																	onChange={(event) => {
																		const nextValue = event.target.value;
																		setBulkEditDrafts((currentDrafts) => ({
																			...currentDrafts,
																			[row.id]: {
																				...(currentDrafts[row.id] ?? {}),
																				[fieldName]: nextValue,
																			},
																		}));
																	}}
																/>
															</div>
														);
													})}
												</div>
											</Fragment>
										);
									})}
								</div>
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
									const columns: ColumnsType<EditableRow> = group.columns.map((column) => ({
										title: column.title,
										dataIndex: column.key,
										key: column.key,
										ellipsis: true,
										align: column.dataType === "number" ? "right" : undefined,
										onHeaderCell: () => ({
											className: "whitespace-nowrap bg-slate-50 text-slate-700",
										}),
										render: (_value: unknown, record: EditableRow) => renderCell(record[column.key]),
									}));

									columns.push({
										title: "Actions",
										key: "actions",
										width: 180,
										onCell: () => ({
											className: "pdf-actions-cell",
										}),
										render: (_: unknown, record: EditableRow) => {
											const isEditing = editingRowKey === record.__rowKey;

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
														loading={deletingRowKey === record.__rowKey}
														onClick={() => void handleDeleteRow(group.key, record.__rowKey)}
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
														{isBulkActiveTable && rowSelectionMode ? (
															<Button variant="secondary" size="small" onClick={handleStopRowSelection}>
																Stop selecting
															</Button>
														) : (
															<Button variant="secondary" size="small" onClick={() => handleStartRowSelection(group.id)}>
																Select multiple rows
															</Button>
														)}
														{isBulkActiveTable && selectedRowKeys.length > 0 ? (
															<Button variant="primary" size="small" onClick={() => handleOpenBulkEdit(group.id)}>
																Bulk Edit
															</Button>
														) : null}
														<Button variant="secondary" size="small" onClick={() => handleClearTable(group.id)}>
															Clear rows
														</Button>
														<Button variant="danger" size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteTable(group.id)} />
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
															isSelectedTable && rowSelectionMode
																? {
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

				<div className="pdf-section-card">
					<div className="pdf-section-header">
						<div>
							<h3 className="pdf-section-title">Raw extracted text</h3>
							<p className="pdf-section-copy">Expand to review the extracted OCR/text content in a scrollable panel.</p>
						</div>
					</div>
					<details className="pdf-text-toggle" open>
						<summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-slate-700">
							Show / hide extracted text
						</summary>
						<div className="pdf-text-panel">
							<pre className="pdf-text-content">{pdf?.extractedText ?? 'No raw text found'}</pre>
						</div>
					</details>
				</div>
			</div>
		</StyledPdfDetailsPage>
	);
};

export default PdfDetailsPage;
