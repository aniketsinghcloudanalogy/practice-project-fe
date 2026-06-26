'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { App } from 'antd';
import type { FormInstance } from 'antd';
import Table from '@/components/common/Table';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import confirm from '@/components/common/antd/Confirm';
import Form from '@/components/common/Form';
import Input from '@/components/common/Input';
import Card from '@/components/common/Card';
import Checkbox from '@/components/common/Checkbox';
import AddressTabs, { buildAddressPayload } from '@/components/common/AddressForm';
import type { AddressTab, AddressFormValues } from '@/components/common/AddressForm';
import { EditOutlined, DeleteOutlined } from '@/components/common/antd/icons';
import {
    useGetCustomersQuery,
    useCreateCustomerMutation,
    useUpdateCustomerMutation,
    useDeleteCustomerMutation,
    useCreateAddressMutation,
    useUpdateAddressMutation,
} from '@/store/services/customer/apiSlice';
import { useCreateContactMutation, useUpdateContactMutation } from '@/store/services/contact/apiSlice';
import type { ColumnsType } from '@/components/common/Table/types';
import type { Customer, CustomerPayload, AddressPayload } from '@/store/services/types';

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ emoji, label, value, bg, color }: {
    emoji: string; label: string; value: number; bg: string; color: string;
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

// ─── Customer Info Fields ─────────────────────────────────────────────────────

const CustomerFields = () => (
    <Form.Item noStyle>
        <div className="grid grid-cols-2 gap-x-4">
            <Form.Item label="Legal Name" name="name">
                <Input placeholder="Enter here" />
            </Form.Item>
            <Form.Item label="Default Currency" name="currency">
                <Input placeholder="$" />
            </Form.Item>
        </div>
        <div className="grid grid-cols-2 gap-x-4">
            <Form.Item label="Industry" name="industry">
                <Input placeholder="Apparel" />
            </Form.Item>
            <Form.Item label="Website" name="website">
                <Input placeholder="Enter here" />
            </Form.Item>
        </div>
    </Form.Item>
);

// ─── Contact Form ────────────────────────────────────────────────────────────

type ContactFormValues = {
    firstName: string;
    lastName?: string;
    email: string;
    primaryContact: string;
    secondaryContact?: string;
    primaryBillingContact?: boolean;
    primaryShippingContact?: boolean;
};

// ─── Modal Body (avatar + customer info + address tabs) ───────────────────────

interface CustomerModalBodyProps {
    customerForm: FormInstance<CustomerPayload>;
    shippingForm: FormInstance<AddressFormValues>;
    billingForm: FormInstance<AddressFormValues>;
    contactForm: FormInstance<ContactFormValues>;
    onFinish: (values: CustomerPayload) => Promise<void>;
    addressTab: AddressTab;
    onAddressTabChange: (tab: AddressTab) => void;
    sameAsShipping: boolean;
    onSameAsShippingChange: (val: boolean) => void;
}

const CustomerModalBody = ({
    customerForm,
    shippingForm,
    billingForm,
    contactForm,
    onFinish,
    addressTab,
    onAddressTabChange,
    sameAsShipping,
    onSameAsShippingChange,
}: CustomerModalBodyProps) => (
    <div>
        <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center shrink-0 mt-1">
                <span className="text-2xl text-gray-300">👤</span>
            </div>
            <div className="flex-1">
                <Form form={customerForm} layout="vertical" onFinish={onFinish}>
                    <CustomerFields />
                </Form>
            </div>
        </div>

        <AddressTabs
            shippingForm={shippingForm}
            billingForm={billingForm}
            activeTab={addressTab}
            onTabChange={onAddressTabChange}
            sameAsShipping={sameAsShipping}
            onSameAsShippingChange={onSameAsShippingChange}
            contactForm={contactForm}
        />
    </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const CustomerPage = () => {
    const { message } = App.useApp();
    const { data: customers = [], isLoading, isFetching, error } = useGetCustomersQuery();
    const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();
    const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();
    const [deleteCustomer] = useDeleteCustomerMutation();
    const [createAddress] = useCreateAddressMutation();
    const [updateAddress] = useUpdateAddressMutation();
    const [createContact] = useCreateContactMutation();
    const [updateContactMutation] = useUpdateContactMutation();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const [createAddressTab, setCreateAddressTab] = useState<AddressTab>('SHIPPING');
    const [createSameAsShipping, setCreateSameAsShipping] = useState(false);
    const [editAddressTab, setEditAddressTab] = useState<AddressTab>('SHIPPING');
    const [editSameAsShipping, setEditSameAsShipping] = useState(false);

    const [createForm] = Form.useForm<CustomerPayload>();
    const [editForm] = Form.useForm<CustomerPayload>();
    const [createShippingForm] = Form.useForm<AddressFormValues>();
    const [createBillingForm] = Form.useForm<AddressFormValues>();
    const [editShippingForm] = Form.useForm<AddressFormValues>();
    const [editBillingForm] = Form.useForm<AddressFormValues>();
    const [createContactForm] = Form.useForm<ContactFormValues>();
    const [editContactForm] = Form.useForm<ContactFormValues>();

    const loading = isLoading || isFetching;

    useEffect(() => { if (error) message.error('Failed to fetch customers'); }, [error, message]);
    useEffect(() => {
        if (!editingCustomer) return;
        editForm.setFieldsValue(editingCustomer);
        const addresses = editingCustomer.addresses ?? [];
        const shipping = addresses.find((a) => a.type === 'SHIPPING' || a.isDefaultShipping);
        const billing = addresses.find((a) => a.type === 'BILLING' || a.isDefaultBilling);
        if (shipping) editShippingForm.setFieldsValue({ addressLine: shipping.addressLine, city: shipping.city, state: shipping.state, zipCode: shipping.zipCode, country: shipping.country, isDefault: shipping.isDefaultShipping });
        if (billing) editBillingForm.setFieldsValue({ addressLine: billing.addressLine, city: billing.city, state: billing.state, zipCode: billing.zipCode, country: billing.country, isDefault: billing.isDefaultBilling });
        const contact = editingCustomer.contacts?.[0];
        if (contact) editContactForm.setFieldsValue({ firstName: contact.firstName, lastName: contact.lastName, email: contact.email, primaryContact: contact.primaryContact, secondaryContact: contact.secondaryContact });
    }, [editingCustomer, editForm, editShippingForm, editBillingForm, editContactForm]);

    const closeCreate = useCallback(() => {
        setIsCreateOpen(false);
        setCreateAddressTab('SHIPPING');
        setCreateSameAsShipping(false);
        createForm.resetFields();
        createShippingForm.resetFields();
        createBillingForm.resetFields();
        createContactForm.resetFields();
    }, [createForm, createShippingForm, createBillingForm, createContactForm]);

    const closeEdit = useCallback(() => {
        setEditingCustomer(null);
        setEditAddressTab('SHIPPING');
        setEditSameAsShipping(false);
        editForm.resetFields();
        editShippingForm.resetFields();
        editBillingForm.resetFields();
        editContactForm.resetFields();
    }, [editForm, editShippingForm, editBillingForm, editContactForm]);

    const saveAddresses = async (
        customerId: string,
        shippingForm: FormInstance<AddressFormValues>,
        billingForm: FormInstance<AddressFormValues>,
        sameAsShipping: boolean,
    ) => {
        const saves: Promise<unknown>[] = [];
        const shippingValues: AddressFormValues | null = await shippingForm.validateFields().catch(() => null);

        if (shippingValues?.addressLine) {
            saves.push(createAddress({ customerId, body: buildAddressPayload(shippingValues, 'SHIPPING') }).unwrap());
        }

        if (!sameAsShipping) {
            const billingValues: AddressFormValues | null = await billingForm.validateFields().catch(() => null);
            if (billingValues?.addressLine) {
                saves.push(createAddress({ customerId, body: buildAddressPayload(billingValues, 'BILLING') }).unwrap());
            }
        } else if (shippingValues?.addressLine) {
            saves.push(createAddress({ customerId, body: buildAddressPayload(shippingValues, 'BILLING') }).unwrap());
        }

        if (saves.length) await Promise.all(saves);
    };

    const handleCreate = async (values: CustomerPayload) => {
        try {
            const res = await createCustomer(values).unwrap();
            const newId = res.data?.id;
            if (!newId) throw new Error();
            await saveAddresses(newId, createShippingForm, createBillingForm, createSameAsShipping);
            const contactValues = createContactForm.getFieldsValue();
            if (contactValues?.firstName && contactValues?.email && contactValues?.primaryContact) {
                await createContact({
                    firstName: contactValues.firstName,
                    lastName: contactValues.lastName,
                    email: contactValues.email,
                    primaryContact: contactValues.primaryContact,
                    secondaryContact: contactValues.secondaryContact,
                    customerId: newId,
                } as any).unwrap();
            }
            message.success('Customer created successfully');
            closeCreate();
        } catch {
            message.error('Failed to create customer');
        }
    };

    const handleUpdate = async (values: CustomerPayload) => {
        if (!editingCustomer) return;
        try {
            await updateCustomer({ id: editingCustomer.id, body: values }).unwrap();

            const addresses = editingCustomer.addresses ?? [];
            const shippingAddr = addresses.find((a) => a.type === 'SHIPPING' || a.isDefaultShipping);
            const billingAddr = addresses.find((a) => a.type === 'BILLING' || a.isDefaultBilling);

            const shippingValues = editShippingForm.getFieldsValue();
            const billingValues = editSameAsShipping ? shippingValues : editBillingForm.getFieldsValue();

            const updates: Promise<unknown>[] = [];

            if (shippingValues?.addressLine && shippingValues.isDefault) {
                const payload = buildAddressPayload(shippingValues, 'SHIPPING');
                if (shippingAddr) updates.push(updateAddress({ customerId: editingCustomer.id, addressId: shippingAddr.id, body: payload }).unwrap());
                else updates.push(createAddress({ customerId: editingCustomer.id, body: payload }).unwrap());
            }

            if (billingValues?.addressLine && (editSameAsShipping ? shippingValues.isDefault : billingValues.isDefault)) {
                const payload = buildAddressPayload(editSameAsShipping ? shippingValues : billingValues, 'BILLING');
                if (billingAddr) updates.push(updateAddress({ customerId: editingCustomer.id, addressId: billingAddr.id, body: payload }).unwrap());
                else updates.push(createAddress({ customerId: editingCustomer.id, body: payload }).unwrap());
            }

            const contactValues = editContactForm.getFieldsValue();
            const existingContact = editingCustomer.contacts?.[0];
            if (contactValues?.firstName && contactValues?.email && contactValues?.primaryContact) {
                const contactPayload = {
                    firstName: contactValues.firstName,
                    lastName: contactValues.lastName,
                    email: contactValues.email,
                    primaryContact: contactValues.primaryContact,
                    secondaryContact: contactValues.secondaryContact,
                    customerId: editingCustomer.id,
                } as any;
                if (existingContact) {
                    updates.push(updateContactMutation({ id: existingContact.id, body: contactPayload }).unwrap());
                } else {
                    updates.push(createContact(contactPayload).unwrap());
                }
            }

            if (updates.length) await Promise.all(updates);

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

    const industryCount = useMemo(
        () => new Set(customers.map((c) => c.industry).filter(Boolean)).size,
        [customers],
    );

    const columns: ColumnsType<Customer> = useMemo(() => [
        {
            title: 'Name', dataIndex: 'name', key: 'name', width: 180,
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
            title: 'Organization', dataIndex: 'organization', key: 'organization', width: 180,
            render: (val?: string) => val
                ? <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">{val}</span>
                : <span className="text-gray-300">—</span>,
        },
        {
            title: 'Industry', dataIndex: 'industry', key: 'industry', width: 150,
            render: (val?: string) => <span className="text-gray-600">{val || '—'}</span>,
        },
        {
            title: 'Currency', dataIndex: 'currency', key: 'currency', width: 100,
            render: (val?: string) => <span className="font-mono text-sm text-gray-700">{val || '—'}</span>,
        },
        {
            title: 'Website', dataIndex: 'website', key: 'website', width: 200,
            render: (val?: string) => val
                ? <a href={val} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline text-sm">{val}</a>
                : <span className="text-gray-300">—</span>,
        },
        {
            title: 'Actions', key: 'actions', width: 100,
            render: (_: unknown, record: Customer) => (
                <div className="flex gap-2 justify-center">
                    <Button variant="icon-button-1" onClick={() => setEditingCustomer(record)}><EditOutlined /></Button>
                    <Button variant="icon-button-2" onClick={() => handleDelete(record.id)} className="bg-red-50! border! border-red-200! w-10! h-7!"><DeleteOutlined /></Button>
                </div>
            ),
        },
    ], [handleDelete]);

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

            {/* ── Create Modal ── */}
            <Modal
                title={<span className="text-base font-semibold">Add Customer</span>}
                open={isCreateOpen}
                onCancel={closeCreate}
                width="min(540px, 95vw)"
                variant="compact"
                footer={
                    <div className="flex justify-end gap-2 pt-2">
                        <Button onClick={closeCreate}>Cancel</Button>
                        <Button type="primary" loading={isCreating} onClick={() => createForm.submit()}>
                            Next
                        </Button>
                    </div>
                }
            >
                <div className="mt-2 max-h-[70vh] overflow-y-auto pr-1">
                    <CustomerModalBody
                        customerForm={createForm}
                        shippingForm={createShippingForm}
                        billingForm={createBillingForm}
                        contactForm={createContactForm}
                        onFinish={handleCreate}
                        addressTab={createAddressTab}
                        onAddressTabChange={setCreateAddressTab}
                        sameAsShipping={createSameAsShipping}
                        onSameAsShippingChange={setCreateSameAsShipping}
                    />
                </div>
            </Modal>

            {/* ── Edit Modal ── */}
            <Modal
                title={<span className="text-base font-semibold">Edit Customer</span>}
                open={!!editingCustomer}
                onCancel={closeEdit}
                width="min(560px, 95vw)"
                variant="compact"
                footer={
                    <div className="flex justify-end gap-2 pt-2">
                        <Button onClick={closeEdit}>Cancel</Button>
                        <Button type="primary" loading={isUpdating} onClick={() => editForm.submit()}>Save Changes</Button>
                    </div>
                }
            >
                <div className="max-h-[70vh] overflow-y-auto pr-1 mt-2">
                    <CustomerModalBody
                        customerForm={editForm}
                        shippingForm={editShippingForm}
                        billingForm={editBillingForm}
                        contactForm={editContactForm}
                        onFinish={handleUpdate}
                        addressTab={editAddressTab}
                        onAddressTabChange={setEditAddressTab}
                        sameAsShipping={editSameAsShipping}
                        onSameAsShippingChange={setEditSameAsShipping}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default CustomerPage;
