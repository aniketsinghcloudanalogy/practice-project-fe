'use client';

import React, { useState } from 'react';
import { App } from 'antd';
import { useParams } from 'next/navigation';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Table from '@/components/common/Table';
import Select from '@/components/common/Select';
import confirm from '@/components/common/antd/Confirm';
import { EditOutlined, DeleteOutlined,CheckOutlined} from '@/components/common/antd/icons';
import AddressTabs, { buildAddressPayload } from '@/components/common/AddressForm';
import type { AddressFormValues, AddressTab } from '@/components/common/AddressForm';
import Form from '@/components/common/Form';
import {
  useGetCustomerQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} from '@/store/services/customer/apiSlice';
import type { Address } from '@/store/services/types';

const CustomerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { message } = App.useApp();

  const { data: customer, isLoading } = useGetCustomerQuery(id);
  const [createAddress, { isLoading: isCreatingAddr }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdatingAddr }] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();

  const [addrOpen, setAddrOpen] = useState(false);
  const [editingAddr, setEditingAddr] = useState<Address | null>(null);
  const [addrTab, setAddrTab] = useState<AddressTab>('SHIPPING');
  const [sameAsShipping, setSameAsShipping] = useState(false);
  const [shippingForm] = Form.useForm<AddressFormValues>();
  const [billingForm] = Form.useForm<AddressFormValues>();

  const [addrFilter, setAddrFilter] = useState<'BILLING' | 'SHIPPING'>('SHIPPING');

  const addresses = (customer?.addresses ?? []) as Address[];

  // Deduplicate: if a SHIPPING address has an identical BILLING address, hide the BILLING entry
  const deduplicatedAddresses = addresses.filter((a) => {
    if (a.type !== 'BILLING') return true;
    return !addresses.some(
      (s) =>
        s.type === 'SHIPPING' &&
        s.addressLine === a.addressLine &&
        s.city === a.city &&
        s.state === a.state &&
        s.zipCode === a.zipCode &&
        s.country === a.country
    );
  });

  const filteredAddresses = deduplicatedAddresses.filter((a) => a.type === addrFilter);

  const addrColumns = [
    { title: 'Type', dataIndex: 'type', key: 'type', width: 180,
      render: (type: string, addr: Address) => (
        <div className="flex flex-wrap gap-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${type === 'BILLING' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>{type}</span>
          {addr.isDefaultBilling && <span className="text-xs font-medium px-2 py-0.5 rounded-full  text-blue-700  "><CheckOutlined /></span>}
          {addr.isDefaultShipping && <span className="text-xs font-medium px-2 py-0.5 rounded-full  text-green-700  "><CheckOutlined /></span>}
        </div>
      ) },
    { title: 'Address', dataIndex: 'addressLine', key: 'addressLine' },
    { title: 'City', dataIndex: 'city', key: 'city' },
    { title: 'State', dataIndex: 'state', key: 'state' },
    { title: 'Zip', dataIndex: 'zipCode', key: 'zipCode' },
    { title: 'Country', dataIndex: 'country', key: 'country' },
    {
      title: 'Actions', key: 'actions', width: 80,
      render: (_: unknown, addr: Address) => (
        <div className="flex gap-1">
          <Button variant="icon-button-1" onClick={() => { setEditingAddr(addr); setAddrOpen(true); }}><EditOutlined /></Button>
          <Button variant="icon-button-2" onClick={() => handleAddrDelete(addr.id)} className="bg-red-50! border! border-red-200! w-8! h-7!"><DeleteOutlined /></Button>
        </div>
      ),
    },
  ];

  const handleAddrAfterOpenChange = (open: boolean) => {
    if (!open) {
      shippingForm.resetFields();
      billingForm.resetFields();
      setSameAsShipping(false);
      setAddrTab('SHIPPING');
      setEditingAddr(null);
      return;
    }
    if (editingAddr) {
      const isBilling = editingAddr.type === 'BILLING';
      const targetForm = isBilling ? billingForm : shippingForm;
      targetForm.setFieldsValue({
        addressLine: editingAddr.addressLine,
        city: editingAddr.city,
        state: editingAddr.state,
        zipCode: editingAddr.zipCode,
        country: editingAddr.country,
        isDefault: isBilling ? editingAddr.isDefaultBilling : editingAddr.isDefaultShipping,
      });
      setAddrTab(isBilling ? 'BILLING' : 'SHIPPING');
    }
  };

  const handleAddrSave = async () => {
    try {
      const saves: Promise<unknown>[] = [];

      const shippingValues = await shippingForm.validateFields().catch(() => null);
      if (shippingValues?.addressLine) {
        const body = buildAddressPayload(shippingValues, 'SHIPPING');
        if (editingAddr && editingAddr.type === 'SHIPPING') {
          saves.push(updateAddress({ customerId: id, addressId: editingAddr.id, body }).unwrap());
        } else {
          saves.push(createAddress({ customerId: id, body }).unwrap());
        }
      }

      if (!sameAsShipping) {
        const billingValues = await billingForm.validateFields().catch(() => null);
        if (billingValues?.addressLine) {
          const body = buildAddressPayload(billingValues, 'BILLING');
          if (editingAddr && editingAddr.type === 'BILLING') {
            saves.push(updateAddress({ customerId: id, addressId: editingAddr.id, body }).unwrap());
          } else {
            saves.push(createAddress({ customerId: id, body }).unwrap());
          }
        }
      }

      if (!saves.length) { message.warning('No address data to save'); return; }
      await Promise.all(saves);
      message.success('Address saved');
      setAddrOpen(false);
    } catch (err: any) {
      message.error(err?.data?.message || err?.message || 'Failed to save address');
    }
  };

  const handleAddrDelete = (addressId: string) => {
    confirm({
      title: 'Delete Address',
      content: 'Are you sure?',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteAddress({ customerId: id, addressId }).unwrap();
          message.success('Address deleted');
        } catch {
          message.error('Failed to delete address');
        }
      },
    });
  };

  if (isLoading) return <div className="p-6 text-gray-400">Loading...</div>;
  if (!customer) return <div className="p-6 text-gray-400">Customer not found.</div>;

  return (
    <div className="px-4 pb-6 pt-0">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-linear-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
          {customer.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{customer.name || '—'}</h1>
          <p className="text-sm text-gray-400">{customer.industry || '—'}{customer.organization ? ` · ${customer.organization}` : ''}</p>
        </div>
      </div>

      {/* Addresses Section */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-base font-semibold text-gray-800">Addresses</span>
        <div className="flex items-center gap-2">
          <Select
            value={addrFilter}
            onChange={(v) => setAddrFilter(v as 'BILLING' | 'SHIPPING')}
            options={[
              { label: 'Billing', value: 'BILLING' },
              { label: 'Shipping', value: 'SHIPPING' },
            ]}
            style={{ width: 120 }}
          />
          <Button type="primary" onClick={() => { setEditingAddr(null); setAddrOpen(true); }}>+ Add Address</Button>
        </div>
      </div>

      <Table
        dataSource={filteredAddresses}
        columns={addrColumns}
        rowKey="id"
        pagination={false}
        locale={{ emptyText: 'No addresses yet' }}
      />

      <Modal
        title={editingAddr ? 'Edit Address' : 'Add Address'}
        open={addrOpen}
        onCancel={() => setAddrOpen(false)}
        afterOpenChange={handleAddrAfterOpenChange}
        width="min(540px, 95vw)"
        styles={{
          container: { padding: '16px 0 0' },
          header: { padding: '0 16px 12px', marginBottom: 0, borderBottom: '1px solid #f1f5f9' },
          body: { padding: '0 16px', backgroundColor: '#ffffff' },
          footer: { padding: '12px 16px 16px', borderTop: '1px solid #f1f5f9', backgroundColor: '#ffffff', borderRadius: '0 0 8px 8px' },
        }}
        forceRender
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setAddrOpen(false)}>Cancel</Button>
            <Button type="primary" loading={isCreatingAddr || isUpdatingAddr} onClick={handleAddrSave}>Save</Button>
          </div>
        }
      >
        <div className="max-h-[70vh] overflow-y-auto">
          <AddressTabs
            shippingForm={shippingForm}
            billingForm={billingForm}
            activeTab={addrTab}
            onTabChange={setAddrTab}
            sameAsShipping={sameAsShipping}
            onSameAsShippingChange={setSameAsShipping}
          />
        </div>
      </Modal>
    </div>
  );
};

export default CustomerProfile;
