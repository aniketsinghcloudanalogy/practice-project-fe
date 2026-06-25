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
import {EditOutlined, DeleteOutlined} from "@/components/common/antd/icons"
import {
    useGetCustomersQuery,
    useCreateCustomerMutation,
    useUpdateCustomerMutation,
    useDeleteCustomerMutation,
} from '@/store/services/customer/apiSlice';
import type { ColumnsType } from '@/components/common/Table/types';
import type { Customer, CustomerPayload } from '@/store/services/types';

const StatCard = ({
    emoji,
    label,
    value,
    bg,
    color,
}: {
    emoji: string;
    label: string;
    value: number;
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

const CustomerPage = () => {
    const { message } = App.useApp();
    const { data: customers = [], isLoading, isFetching, error } = useGetCustomersQuery();
    const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();
    const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();
    const [deleteCustomer] = useDeleteCustomerMutation();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const loading = isLoading || isFetching;

    useEffect(() => {
        if (error) message.error('Failed to fetch customers');
    }, [error, message]);

    useEffect(() => {
        if (editingCustomer) {
            editForm.setFieldsValue(editingCustomer);
        }
    }, [editingCustomer, editForm]);

    const closeCreate = useCallback(() => {
        setIsCreateOpen(false);
        createForm.resetFields();
    }, [createForm]);

    const closeEdit = useCallback(() => {
        setEditingCustomer(null);
        editForm.resetFields();
    }, [editForm]);

    const handleCreate = async (values: CustomerPayload) => {
        try {
            await createCustomer(values).unwrap();
            message.success('Customer created successfully');
            closeCreate();
        } catch {
            message.error('Failed to create customer');
        }
    };

    const handleUpdate = async (values: Partial<CustomerPayload>) => {
        if (!editingCustomer) return;
        try {
            await updateCustomer({ id: editingCustomer.id, body: values }).unwrap();
            message.success('Customer updated successfully');
            closeEdit();
        } catch {
            message.error('Failed to update customer');
        }
    };

    const handleDelete = useCallback((id: string) => {
        confirm({
            title: 'Delete Customer',
            content: 'Are you sure you want to delete this customer?',
            okText: 'Yes, Delete',
            okButtonProps: { danger: true },
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteCustomer(id).unwrap();
                    message.success('Customer deleted successfully');
                } catch {
                    message.error('Failed to delete customer');
                }
            },
        });
    }, [deleteCustomer, message]);

    const industryCount = useMemo(() => new Set(customers.map((c) => c.industry).filter(Boolean)).size, [customers]);

    const columns: ColumnsType<Customer> = useMemo(() => [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: 180,
            render: (val: string) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {val?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <span className="font-medium text-gray-800">{val || '—'}</span>
                </div>
            ),
        },
        {
            title: 'Organization',
            dataIndex: 'organization',
            key: 'organization',
            width: 180,
            render: (val?: string) => val
                ? <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">{val}</span>
                : <span className="text-gray-300">—</span>,
        },
        {
            title: 'Industry',
            dataIndex: 'industry',
            key: 'industry',
            width: 150,
            render: (val?: string) => <span className="text-gray-600">{val || '—'}</span>,
        },
        {
            title: 'Currency',
            dataIndex: 'currency',
            key: 'currency',
            width: 100,
            render: (val?: string) => <span className="font-mono text-sm text-gray-700">{val || '—'}</span>,
        },
        {
            title: 'Website',
            dataIndex: 'website',
            key: 'website',
            width: 200,
            render: (val?: string) => val
                ? <a href={val} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline text-sm">{val}</a>
                : <span className="text-gray-300">—</span>,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            render: (_: unknown, record: Customer) => (
                <div className="flex gap-2 justify-center">
                      <Button
                        variant='icon-button-1'
                        onClick={() => setEditingCustomer(record)}
                    >
                        <EditOutlined/>
                    </Button>
     
                      <Button
                        variant='icon-button-2'
                        onClick={() => handleDelete(record.id)}
                        className="bg-red-50! border! border-red-200! w-10! h-7!"
                    >
                        <DeleteOutlined/>
                    </Button>
                </div>
            ),
        },
    ], [handleDelete, setEditingCustomer]);

    const formFields = (
        <Form.Item noStyle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <Form.Item label="Name" name="name">
                    <Input placeholder="Customer name" />
                </Form.Item>
                <Form.Item label="Organization" name="organization">
                    <Input placeholder="Organization" />
                </Form.Item>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <Form.Item label="Industry" name="industry">
                    <Input placeholder="e.g. Technology" />
                </Form.Item>
                <Form.Item label="Currency" name="currency">
                    <Input placeholder="e.g. USD" />
                </Form.Item>
            </div>
            <Form.Item label="Website" name="website">
                <Input placeholder="https://example.com" />
            </Form.Item>
        </Form.Item>
    );

    return (
        <div className="px-2 pb-3 pt-0 sm:px-4 sm:pb-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Customers</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Manage your customer directory</p>
                </div>
                <Button type="primary" onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
                    + Create Customer
                </Button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                <StatCard emoji="🏢" label="Total Customers" value={customers.length} bg="bg-blue-100" color="text-blue-600" />
                <StatCard emoji="🌐" label="Industries" value={industryCount} bg="bg-violet-100" color="text-violet-600" />
                <StatCard emoji="✅" label="Active" value={customers.filter((c) => !c.isDeleted).length} bg="bg-green-100" color="text-green-600" />
            </div>

            {/* Table */}
            <Card className="rounded-2xl! shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table
                        columns={columns}
                        dataSource={customers}
                        rowKey="id"
                        loading={loading}
                        scroll={{ x: 900 }}
                        pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (total) => `${total} customers` }}
                        locale={{ emptyText: '📭 No customers found. Create your first customer!' }}
                    />
                </div>
            </Card>

            {/* Create Modal */}
            <Modal
                title={<span className="text-base font-semibold">Create New Customer</span>}
                open={isCreateOpen}
                onCancel={closeCreate}
                width="min(480px, 95vw)"
                variant="compact"
                footer={
                    <div className="flex justify-end gap-2 pt-2">
                        <Button onClick={closeCreate}>Cancel</Button>
                        <Button type="primary" loading={isCreating} onClick={() => createForm.submit()}>
                            Create Customer
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
                title={<span className="text-base font-semibold">Edit Customer</span>}
                open={!!editingCustomer}
                onCancel={closeEdit}
                width="min(480px, 95vw)"
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

export default CustomerPage;
