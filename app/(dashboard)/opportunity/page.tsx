'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { App } from 'antd';
import Table from '@/components/common/Table';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import confirm from '@/components/common/antd/Confirm';
import Form from '@/components/common/Form';
import Input from '@/components/common/Input';
import Card from '@/components/common/Card';
import { EditOutlined, DeleteOutlined } from '@/components/common/antd/icons';
import {
    useGetOpportunitiesQuery,
    useCreateOpportunityMutation,
    useUpdateOpportunityMutation,
    useDeleteOpportunityMutation,
} from '@/store/services/opportunity/apiSlice';
import type { ColumnsType } from '@/components/common/Table/types';
import type { Opportunity, OpportunityPayload } from '@/store/services/types';

const StatCard = ({
    emoji,
    label,
    value,
    bg,
    color,
}: {
    emoji: string;
    label: string;
    value: number | string;
    bg: string;
    color: string;
}) => (
    <Card className="rounded-2xl! shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
            <div className={`${bg} ${color} rounded-xl p-3 text-2xl`}>{emoji}</div>
            <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    </Card>
);

const OpportunityPage = () => {
    const { message } = App.useApp();
    const { data: opportunities = [], isLoading, isFetching, error } = useGetOpportunitiesQuery();
    const [createOpportunity, { isLoading: isCreating }] = useCreateOpportunityMutation();
    const [updateOpportunity, { isLoading: isUpdating }] = useUpdateOpportunityMutation();
    const [deleteOpportunity] = useDeleteOpportunityMutation();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const loading = isLoading || isFetching;

    useEffect(() => {
        if (error) message.error('Failed to fetch opportunities');
    }, [error, message]);

    useEffect(() => {
        if (editingOpportunity) {
            editForm.setFieldsValue(editingOpportunity);
        }
    }, [editingOpportunity, editForm]);

    const closeCreate = useCallback(() => {
        setIsCreateOpen(false);
        createForm.resetFields();
    }, [createForm]);

    const closeEdit = useCallback(() => {
        setEditingOpportunity(null);
        editForm.resetFields();
    }, [editForm]);

    const handleCreate = async (values: OpportunityPayload) => {
        try {
            await createOpportunity(values).unwrap();
            message.success('Opportunity created successfully');
            closeCreate();
        } catch {
            message.error('Failed to create opportunity');
        }
    };

    const handleUpdate = async (values: Partial<OpportunityPayload>) => {
        if (!editingOpportunity) return;
        try {
            await updateOpportunity({ id: editingOpportunity.id, body: values }).unwrap();
            message.success('Opportunity updated successfully');
            closeEdit();
        } catch {
            message.error('Failed to update opportunity');
        }
    };

    const handleDelete = useCallback((id: string) => {
        confirm({
            title: 'Delete Opportunity',
            content: 'Are you sure you want to delete this opportunity?',
            okText: 'Yes, Delete',
            okButtonProps: { danger: true },
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteOpportunity(id).unwrap();
                    message.success('Opportunity deleted successfully');
                } catch {
                    message.error('Failed to delete opportunity');
                }
            },
        });
    }, [deleteOpportunity, message]);

    const totalAmount = useMemo(
        () => opportunities.reduce((sum, o) => sum + (o.amount ?? 0), 0),
        [opportunities],
    );

    const columns: ColumnsType<Opportunity> = useMemo(() => [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            width: 180,
            render: (val?: string) => <span className="font-medium text-gray-800">{val || '—'}</span>,
        },
        {
            title: 'Organization',
            dataIndex: 'organization',
            key: 'organization',
            width: 160,
            render: (val?: string) => val
                ? <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">{val}</span>
                : <span className="text-gray-300">—</span>,
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            width: 120,
            render: (val?: number) => val != null
                ? <span className="font-mono text-sm text-gray-700">${val.toLocaleString()}</span>
                : <span className="text-gray-300">—</span>,
        },
        {
            title: 'Probability',
            dataIndex: 'probability',
            key: 'probability',
            width: 110,
            render: (val?: number) => val != null
                ? <span className="text-sm text-gray-600">{val}%</span>
                : <span className="text-gray-300">—</span>,
        },
        {
            title: 'Close Date',
            dataIndex: 'closeDate',
            key: 'closeDate',
            width: 130,
            render: (val?: string) => val
                ? <span className="text-sm text-gray-600">{new Date(val).toLocaleDateString()}</span>
                : <span className="text-gray-300">—</span>,
        },
        {
            title: 'RFQ/RFI',
            dataIndex: 'rfqRfiNumber',
            key: 'rfqRfiNumber',
            width: 120,
            render: (val?: string) => <span className="text-sm text-gray-600">{val || '—'}</span>,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            render: (_: unknown, record: Opportunity) => (
                <div className="flex gap-2">
                    <Button variant="icon-button-1" onClick={() => setEditingOpportunity(record)}>
                        <EditOutlined />
                    </Button>
                    <Button
                        variant="icon-button-2"
                        onClick={() => handleDelete(record.id)}
                        className="!bg-red-50 !border !border-red-200 !w-10 !h-7"
                    >
                        <DeleteOutlined />
                    </Button>
                </div>
            ),
        },
    ], [handleDelete]);

    const formFields = (
        <Form.Item noStyle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <Form.Item label="Customer ID" name="customerId" rules={[{ required: true, message: 'Customer ID is required' }]}>
                    <Input placeholder="Customer ID" />
                </Form.Item>
                <Form.Item label="Title" name="title">
                    <Input placeholder="Opportunity title" />
                </Form.Item>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <Form.Item label="Organization" name="organization">
                    <Input placeholder="Organization" />
                </Form.Item>
                <Form.Item label="Amount" name="amount">
                    <Input placeholder="e.g. 50000" type="number" />
                </Form.Item>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <Form.Item label="Probability (%)" name="probability">
                    <Input placeholder="0 - 100" type="number" />
                </Form.Item>
                <Form.Item label="Close Date" name="closeDate">
                    <Input placeholder="YYYY-MM-DD" />
                </Form.Item>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <Form.Item label="Expected Price" name="expectedPrice">
                    <Input placeholder="e.g. 45000" type="number" />
                </Form.Item>
                <Form.Item label="RFQ/RFI Number" name="rfqRfiNumber">
                    <Input placeholder="RFQ/RFI #" />
                </Form.Item>
            </div>
            <Form.Item label="Description" name="description">
                <Input placeholder="Description" />
            </Form.Item>
        </Form.Item>
    );

    return (
        <div className="px-2 pb-3 pt-0 sm:px-4 sm:pb-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Opportunities</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Manage your sales opportunities</p>
                </div>
                <Button type="primary" onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
                    + Create Opportunity
                </Button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                <StatCard emoji="🎯" label="Total Opportunities" value={opportunities.length} bg="bg-blue-100" color="text-blue-600" />
                <StatCard emoji="💰" label="Total Amount" value={`$${totalAmount.toLocaleString()}`} bg="bg-green-100" color="text-green-600" />
                <StatCard emoji="✅" label="Active" value={opportunities.filter((o) => !o.isDeleted).length} bg="bg-violet-100" color="text-violet-600" />
            </div>

            {/* Table */}
            <Card className="rounded-2xl! shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table
                        columns={columns}
                        dataSource={opportunities}
                        rowKey="id"
                        loading={loading}
                        scroll={{ x: 900 }}
                        pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (total) => `${total} opportunities` }}
                        locale={{ emptyText: '📭 No opportunities found. Create your first opportunity!' }}
                    />
                </div>
            </Card>

            {/* Create Modal */}
            <Modal
                title={<span className="text-base font-semibold">Create New Opportunity</span>}
                open={isCreateOpen}
                onCancel={closeCreate}
                width="min(560px, 95vw)"
                variant="compact"
                footer={
                    <div className="flex justify-end gap-2 pt-2">
                        <Button onClick={closeCreate}>Cancel</Button>
                        <Button type="primary" loading={isCreating} onClick={() => createForm.submit()}>
                            Create Opportunity
                        </Button>
                    </div>
                }
            >
                <Form form={createForm} layout="vertical" onFinish={handleCreate} className="mt-4">
                    {formFields}
                </Form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                title={<span className="text-base font-semibold">Edit Opportunity</span>}
                open={!!editingOpportunity}
                onCancel={closeEdit}
                width="min(560px, 95vw)"
                variant="compact"
                footer={
                    <div className="flex justify-end gap-2 pt-2">
                        <Button onClick={closeEdit}>Cancel</Button>
                        <Button type="primary" loading={isUpdating} onClick={() => editForm.submit()}>
                            Save Changes
                        </Button>
                    </div>
                }
            >
                <Form form={editForm} layout="vertical" onFinish={handleUpdate} className="mt-4">
                    {formFields}
                </Form>
            </Modal>
        </div>
    );
};

export default OpportunityPage;
