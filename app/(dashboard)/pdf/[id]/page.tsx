"use client";

import  { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftOutlined, CloseOutlined, DeleteOutlined, EditOutlined, FilePdfOutlined, SaveOutlined } from "@ant-design/icons";
import Button from "@/components/common/Button";
import Input from "@/components/common/antd/Input";
import Table from "@/components/common/antd/Table";
import message from "@/components/common/Message";
import AntdModal from "@/components/common/antd/Modal";
import { StyledPdfDetailsPage } from "@/components/pdf/PdfDetails.styles";
import {
	isStructuredExtractedData,
	isMultiTableExtractedData,
	useClearPdfExtractedDataMutation,
	useDeletePdfMutation,
	useGetPdfByIdQuery,
	useUpdatePdfExtractedDataMutation,
} from "@/store/services/pdf/apiSlice";
import type { ExtractedData, PdfColumn, PdfExtractedTable } from "@/store/services/types";

type EditableRow = Record<string, any> & { __rowKey: string };

type EditableTableGroup = {
	key: string;
	title: string;
	columns: PdfColumn[];
	rows: EditableRow[];
	index: number;
};

const buildEditableRows = (rows: Record<string, any>[] | undefined): EditableRow[] =>
	(rows ?? []).map((row, index) => ({
		...row,
		__rowKey: String((row as { id?: string | number }).id ?? index),
	}));

const stripEditableRowKey = (row: EditableRow) => {
	const { __rowKey, ...rest } = row;
	return rest;
};

const getTableTitle = (table: PdfExtractedTable, index: number) => {
	return table.title?.trim() || `Table ${index + 1}`;
};

const isTableShape = (value: unknown): value is PdfExtractedTable => {
	return Boolean(
		value &&
		typeof value === 'object' &&
		!Array.isArray(value) &&
		'columns' in value &&
		'rows' in value &&
		Array.isArray((value as PdfExtractedTable).columns) &&
		Array.isArray((value as PdfExtractedTable).rows),
	)
};

const buildTableGroups = (data: ExtractedData | null | undefined): EditableTableGroup[] => {
	if (!data) return [];


	if (isMultiTableExtractedData(data)) {
		return data.tables.map((table, tableIndex) => ({
			key: `table-${tableIndex + 1}`,
			title: getTableTitle(table, tableIndex),
			columns: table.columns,
			rows: buildEditableRows(table.rows).map((row, rowIndex) => ({
				...row,
				__rowKey: `table-${tableIndex + 1}:${row.__rowKey || rowIndex}`,
			})),
			index: tableIndex,
		}));
	}

	if (isStructuredExtractedData(data)) {
		return [
			{
				key: "table-1",
				title: "Table 1",
				columns: data.columns,
				rows: buildEditableRows(data.rows).map((row, index) => ({
					...row,
					__rowKey: `table-1:${row.__rowKey || index}`,
				})),
				index: 0,
			},
		];
	}

	return [];
};
const serializeTableGroups = (
	tableGroups: EditableTableGroup[],
	originalData: ExtractedData | null | undefined,
): ExtractedData => {
	const serializedTables = tableGroups.map((group) => ({
		title: group.title,
		columns: group.columns,
		rows: group.rows.map(stripEditableRowKey),
	}));

	if (isMultiTableExtractedData(originalData)) {
		return { tables: serializedTables };
	}

	if (isStructuredExtractedData(originalData)) {
		const firstGroup = tableGroups[0];
		return {
			columns: firstGroup.columns,
			rows: firstGroup.rows.map(stripEditableRowKey),
		};
	}

	return serializedTables.length === 1
		? { columns: serializedTables[0].columns, rows: serializedTables[0].rows }
		: { tables: serializedTables };
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

const PdfDetailsPage = () => {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const pdfId = params?.id as string | undefined;

	const { data: pdf, isLoading: loading, error } = useGetPdfByIdQuery(pdfId ?? "", {
		skip: !pdfId,
	});
	const [updateExtractedData, { isLoading: savingExtractedData }] = useUpdatePdfExtractedDataMutation();
	const [clearExtractedData] = useClearPdfExtractedDataMutation();
	const [deletePdf] = useDeletePdfMutation();
	const [messageApi, contextHolder] = message.useMessage();
	const [tableGroups, setTableGroups] = useState<EditableTableGroup[]>([]);
	const [editingRowKey, setEditingRowKey] = useState<string | null>(null);
	const [savingRowKey, setSavingRowKey] = useState<string | null>(null);
	const [deletingRowKey, setDeletingRowKey] = useState<string | null>(null);

	useEffect(() => {
		if (error) {
			messageApi.error("Failed to fetch PDF");
		}
	}, [error, messageApi]);

	const structuredData = isStructuredExtractedData(pdf?.extractedData) ? pdf.extractedData : null;
	const tableDataSource = pdf?.extractedData ?? null;
	const tableGroupCount = tableGroups.length;
	useEffect(() => {
		console.log("PDF extractedData:", pdf?.extractedData);
		console.log("tableGroups:", buildTableGroups(pdf?.extractedData));
	}, [pdf?.extractedData]);

	useEffect(() => {
		setTableGroups(buildTableGroups(tableDataSource));
		setEditingRowKey(null);
		setSavingRowKey(null);
		setDeletingRowKey(null);
	}, [tableDataSource]);

	const persistTableGroups = async (nextGroups: EditableTableGroup[], successMessage: string) => {
		if (!pdf || nextGroups.length === 0) return;

		const extractedData = serializeTableGroups(nextGroups, tableDataSource);

		const response = await updateExtractedData({ id: pdf.id, extractedData }).unwrap();
		messageApi.success(response.message || successMessage);
	};

	const handleSaveRow = async (tableKey: string, rowKey: string) => {
		if (!pdf) return;

		const tableGroup = tableGroups.find((group) => group.key === tableKey);
		if (!tableGroup) return;

		const targetRow = tableGroup.rows.find((row) => row.__rowKey === rowKey);
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

		setSavingRowKey(rowKey);
		try {
			await persistTableGroups(
				tableGroups.map((group) =>
					group.key === tableKey
						? { ...group, rows: group.rows.map((row) => (row.__rowKey === rowKey ? targetRow : row)) }
						: group,
				),
				"Row updated successfully",
			);
			setEditingRowKey(null);
		} catch (mutationError: any) {
			messageApi.error(getErrorMessage(mutationError, "Failed to update row"));
		} finally {
			setSavingRowKey(null);
		}
	};

	const handleCancelEdit = () => {
		setTableGroups(buildTableGroups(tableDataSource));
		setEditingRowKey(null);
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
			currentGroups.map((currentGroup) =>
				currentGroup.key !== tableKey
					? currentGroup
					: {
							...currentGroup,
							rows: currentGroup.rows.map((currentRow) =>
								currentRow.__rowKey === rowKey
									? { ...currentRow, [column.key]: nextValue }
									: currentRow,
							),
						},
			),
		);
	};

	const renderRowEditPanel = (group: EditableTableGroup, record: EditableRow) => (
		<div className="pdf-row-edit-panel">
			<div className="pdf-row-edit-grid">
				{group.columns.map((column, columnIndex) => (
					<div key={column.key} className="pdf-row-edit-field">
						<label htmlFor={`${record.__rowKey}-${column.key}`}>{column.title}</label>
						<Input
							id={`${record.__rowKey}-${column.key}`}
							type={column.dataType === "number" ? "number" : "text"}
							size="middle"
							value={record[column.key] ?? ""}
							autoFocus={columnIndex === 0}
							onChange={(event) =>
								handleRowFieldChange(group.key, record.__rowKey, column, event.target.value)
							}
						/>
					</div>
				))}
			</div>
			<div className="pdf-row-edit-actions">
				<Button
					variant="primary"
					icon={<SaveOutlined />}
					loading={savingRowKey === record.__rowKey || savingExtractedData}
					onClick={() => void handleSaveRow(group.key, record.__rowKey)}
				>
					Save changes
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

		AntdModal.confirm({
			title: "Delete row",
			content: "This will remove only this extracted row from the PDF data.",
			okText: "Delete",
			okButtonProps: { danger: true },
			cancelText: "Cancel",
			onOk: async () => {
				setDeletingRowKey(rowKey);
				try {
					const nextGroups = tableGroups.map((group) =>
						group.key === tableKey
							? { ...group, rows: group.rows.filter((row) => row.__rowKey !== rowKey) }
							: group,
					);
					await persistTableGroups(nextGroups, "Row deleted successfully");
					setTableGroups(nextGroups);
					if (editingRowKey === rowKey) {
						setEditingRowKey(null);
					}
				} catch (mutationError: any) {
					messageApi.error(getErrorMessage(mutationError, "Failed to delete row"));
				} finally {
					setDeletingRowKey(null);
				}
			},
		});
	};

	const handleClear = () => {
		if (!pdf) return;

		AntdModal.confirm({
			title: "Clear extracted data",
			content: "This will remove only the extractedData payload and keep the PDF file intact.",
			okText: "Clear data",
			okButtonProps: { danger: true },
			cancelText: "Cancel",
			onOk: async () => {
				try {
					const response = await clearExtractedData(pdf.id).unwrap();
					messageApi.success(response.message || "Extracted data cleared successfully");
				} catch (mutationError: any) {
					messageApi.error(getErrorMessage(mutationError, "Failed to clear extracted data"));
				}
			},
		});
	};

	const handleDeletePdf = () => {
		if (!pdf) return;

		AntdModal.confirm({
			title: "Delete PDF",
			content: "This will delete the PDF and all of its extracted data.",
			okText: "Delete",
			okButtonProps: { danger: true },
			cancelText: "Cancel",
			onOk: async () => {
				try {
					const response = await deletePdf(pdf.id).unwrap();
					messageApi.success(response.message || "PDF deleted successfully");
					router.push("/pdf");
				} catch (mutationError: any) {
					messageApi.error(getErrorMessage(mutationError, "Failed to delete PDF"));
				}
			},
		});
	};

	const hasStructuredData = tableGroups.some((group) => group.columns.length > 0 && group.rows.length > 0);

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
							<Button variant="secondary" icon={<CloseOutlined />} onClick={handleClear} disabled={!pdf}>
								Clear data
							</Button>
							<Button variant="danger" icon={<DeleteOutlined />} onClick={handleDeletePdf} disabled={!pdf}>
								Delete PDF
							</Button>
						</div>
					</div>

					<div className="p-6">
						{loading ? (
							<div className="pdf-empty-state text-slate-500">
								Loading structured data...
							</div>
						) : hasStructuredData ? (
							<div className="pdf-multi-table-list">
								{tableGroups.map((group) => {
									const columns: any[] = group.columns.map((column) => ({
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

											return (
												<div className="pdf-row-actions">
													{isEditing ? (
														<span className="pdf-editing-badge">Editing</span>
													) : (
														<Button
															variant="secondary"
															icon={<EditOutlined />}
															onClick={() => setEditingRowKey(record.__rowKey)}
														>
															Edit
														</Button>
													)}

													<Button
														variant="danger"
														icon={<DeleteOutlined />}
														loading={deletingRowKey === record.__rowKey}
														onClick={() => void handleDeleteRow(group.key, record.__rowKey)}
													>
														Delete
													</Button>
												</div>
											);
										},
									});

									return (
										<section key={group.key} className="pdf-section-card pdf-table-group">
											<div className="pdf-section-header">
												<div>
													<h3 className="pdf-section-title">{group.title}</h3>
													<p className="pdf-section-copy">
														{group.rows.length} rows • {group.columns.length} columns
													</p>
												</div>
											</div>
											<div className="p-6">
												<div className="pdf-table-shell">
													<Table
														columns={columns as any}
														dataSource={group.rows as any}
														rowKey="__rowKey"
														pagination={false}
														className="pdf-structured-table"
														rowClassName={(row: EditableRow) =>
															editingRowKey === row.__rowKey ? "pdf-editing-row" : ""
														}
														expandable={{
															showExpandColumn: false,
															expandedRowKeys: editingRowKey
																? group.rows.some((row) => row.__rowKey === editingRowKey)
																	? [editingRowKey]
																	: []
																: [],
															expandedRowRender: (record: EditableRow) =>
																editingRowKey === record.__rowKey
																	? renderRowEditPanel(group, record)
																	: null,
															rowExpandable: (record: EditableRow) => editingRowKey === record.__rowKey,
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
